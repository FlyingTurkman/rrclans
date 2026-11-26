"use server"

import { getTranslations } from "next-intl/server"
import { ClanDto } from "@/dtos/clanDTO"
import { LfpListingDto } from "@/dtos/lfgDTO"
import { ServerDto } from "@/dtos/serverDTO"
import { prisma } from "@/lib/prisma"
import { pickServers } from "@/lib/servers/active"
import { homePreviewLimit } from "@/lib/src/constants"
import { getActiveServerRange } from "@/lib/src/serverLifetime"
import type { ActionResult, HomeDashboard } from "@/types"

/** Numbers and newest entries of the site for the home page. Public data only. */
export async function getHomeDashboard(): Promise<ActionResult<HomeDashboard>> {
    const t = await getTranslations("HomePage")

    const activeServer = { beganAt: getActiveServerRange() }

    try {
        const [clanCount, playerCount, activeServerCount, lfcCount, lfpCount, clans, servers, listings] = await Promise.all([
            prisma.clan.count(),
            prisma.user.count(),
            prisma.server.count({ where: activeServer }),
            prisma.lfcListing.count(),
            prisma.lfpListing.count(),
            prisma.clan.findMany({
                orderBy: [{ createdAt: "desc" }, { id: "desc" }],
                take: homePreviewLimit,
                include: { _count: { select: { members: true } } },
            }),
            prisma.server.findMany({
                where: activeServer,
                orderBy: [{ beganAt: "desc" }, { id: "desc" }],
                take: homePreviewLimit,
                include: { _count: { select: { clans: true, players: { where: { isActive: true } } } } },
            }),
            prisma.lfpListing.findMany({
                orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
                take: homePreviewLimit,
                include: {
                    clan: {
                        include: {
                            _count: { select: { members: true } },
                            servers: { where: { server: activeServer }, include: { server: true } },
                        },
                    },
                },
            }),
        ])

        return {
            success: true,
            data: {
                stats: { clanCount, playerCount, activeServerCount, lfcCount, lfpCount },
                clans: clans.map((clan) => ({ ...new ClanDto(clan) })),
                servers: servers.map((server) => ({
                    server: { ...new ServerDto(server) },
                    clanCount: server._count.clans,
                    playerCount: server._count.players,
                })),
                lfpListings: listings.map((listing) => {
                    const clanServers = new Map(listing.clan.servers.map(({ server }) => [server.id, server]))

                    return { ...new LfpListingDto(listing, pickServers(listing.serverIds ?? [], clanServers)) }
                }),
            },
        }
    } catch (error) {
        console.error("getHomeDashboard failed", error)

        return { success: false, error: t("loadError") }
    }
}
