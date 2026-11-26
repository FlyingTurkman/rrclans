"use server"

import { getTranslations } from "next-intl/server"
import type { Prisma } from "@prisma/client"
import { LfpListingDto } from "@/dtos/lfgDTO"
import { prisma } from "@/lib/prisma"
import { lfpQuerySchema } from "@/lib/schemas/lfg-query.schema"
import { pickServers } from "@/lib/servers/active"
import { pageLimit } from "@/lib/src/constants"
import type { ListSort } from "@/lib/src/listSorts"
import { getActiveServerRange } from "@/lib/src/serverLifetime"
import type { ActionResult, LfpList } from "@/types"

// Newest and oldest use the last change. The id is a tie-breaker, so listings
// never repeat or go missing between pages.
const orderBy: Record<ListSort, Prisma.LfpListingOrderByWithRelationInput[]> = {
    newest: [{ updatedAt: "desc" }, { id: "desc" }],
    oldest: [{ updatedAt: "asc" }, { id: "asc" }],
    name: [{ clan: { clanName: "asc" } }, { id: "asc" }],
}

/** Returns one page of clans that search for players. */
export async function getLfpListings(input: unknown): Promise<ActionResult<LfpList>> {
    const t = await getTranslations("LfpPage")

    const parsed = lfpQuerySchema.safeParse(input)

    if (!parsed.success) return { success: false, error: t("loadError") }

    const { term, region, server, role, sort, page } = parsed.data

    const activeServer = { beganAt: getActiveServerRange() }
    const clan: Prisma.ClanWhereInput = {}
    const where: Prisma.LfpListingWhereInput = { clan }

    if (region) clan.region = region

    // The listing is for the server and the clan still plays on it.
    if (server) {
        where.serverIds = { has: server }
        clan.servers = { some: { serverId: server, server: activeServer } }
    }

    // Listings saved before ranks existed count as RECRUIT.
    if (role === "RECRUIT") where.OR = [{ role }, { role: null }, { role: { isSet: false } }]
    else if (role) where.role = role

    if (term) {
        clan.OR = [
            { clanName: { contains: term, mode: "insensitive" } },
            { clanTag: { contains: term, mode: "insensitive" } },
        ]
    }

    try {
        const [listings, total] = await Promise.all([
            prisma.lfpListing.findMany({
                where,
                orderBy: orderBy[sort],
                skip: (page - 1) * pageLimit,
                take: pageLimit,
                include: {
                    clan: {
                        include: {
                            _count: { select: { members: true } },
                            servers: { where: { server: activeServer }, include: { server: true } },
                        },
                    },
                },
            }),
            prisma.lfpListing.count({ where }),
        ])

        return {
            success: true,
            data: {
                listings: listings.map((listing) => {
                    const clanServers = new Map(listing.clan.servers.map(({ server }) => [server.id, server]))

                    return { ...new LfpListingDto(listing, pickServers(listing.serverIds ?? [], clanServers)) }
                }),
                total,
                pageCount: Math.max(1, Math.ceil(total / pageLimit)),
            },
        }
    } catch (error) {
        console.error("getLfpListings failed", error)

        return { success: false, error: t("loadError") }
    }
}
