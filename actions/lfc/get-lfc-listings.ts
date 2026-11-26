"use server"

import { getTranslations } from "next-intl/server"
import type { Prisma } from "@prisma/client"
import { LfcListingDto } from "@/dtos/lfgDTO"
import { prisma } from "@/lib/prisma"
import { lfgQuerySchema } from "@/lib/schemas/lfg-query.schema"
import { getActiveServersById, pickServers } from "@/lib/servers/active"
import { pageLimit } from "@/lib/src/constants"
import type { ListSort } from "@/lib/src/listSorts"
import type { ActionResult, LfcList } from "@/types"

// Newest and oldest use the last change. The id is a tie-breaker, so listings
// never repeat or go missing between pages.
const orderBy: Record<ListSort, Prisma.LfcListingOrderByWithRelationInput[]> = {
    newest: [{ updatedAt: "desc" }, { id: "desc" }],
    oldest: [{ updatedAt: "asc" }, { id: "asc" }],
    name: [{ user: { username: "asc" } }, { id: "asc" }],
}

/** Returns one page of players who search for a clan. */
export async function getLfcListings(input: unknown): Promise<ActionResult<LfcList>> {
    const t = await getTranslations("LfcPage")

    const parsed = lfgQuerySchema.safeParse(input)

    if (!parsed.success) return { success: false, error: t("loadError") }

    const { term, region, server, sort, page } = parsed.data

    const user: Prisma.UserWhereInput = {}
    const where: Prisma.LfcListingWhereInput = { user }

    if (region) where.region = region

    try {
        // Only listings for an active server: an expired one shows nothing.
        if (server) {
            const active = await getActiveServersById([server])

            if (!active.has(server)) return { success: true, data: { listings: [], total: 0, pageCount: 1 } }

            where.serverIds = { has: server }
        }

        // Only public names are searched, never the email or the real name.
        if (term) {
            user.OR = [
                { username: { contains: term, mode: "insensitive" } },
                { steamUsername: { contains: term, mode: "insensitive" } },
            ]
        }

        const [listings, total] = await Promise.all([
            prisma.lfcListing.findMany({
                where,
                orderBy: orderBy[sort],
                skip: (page - 1) * pageLimit,
                take: pageLimit,
                include: { user: { omit: { password: true } } },
            }),
            prisma.lfcListing.count({ where }),
        ])

        const servers = await getActiveServersById(listings.flatMap(({ serverIds }) => serverIds ?? []))

        return {
            success: true,
            data: {
                listings: listings.map((listing) => ({ ...new LfcListingDto(listing, pickServers(listing.serverIds ?? [], servers)) })),
                total,
                pageCount: Math.max(1, Math.ceil(total / pageLimit)),
            },
        }
    } catch (error) {
        console.error("getLfcListings failed", error)

        return { success: false, error: t("loadError") }
    }
}
