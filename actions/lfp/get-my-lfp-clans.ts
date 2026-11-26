"use server"

import { getTranslations } from "next-intl/server"
import { ClanDto } from "@/dtos/clanDTO"
import { ServerDto } from "@/dtos/serverDTO"
import { getSession } from "@/lib/auth/session"
import { prisma } from "@/lib/prisma"
import { lfpRoles } from "@/lib/src/clanRoles"
import { getActiveServerRange } from "@/lib/src/serverLifetime"
import type { ActionResult, ManagedLfpClan } from "@/types"

/** Clans whose listing the logged-in user manages (leader and officers). */
export async function getMyLfpClans(): Promise<ActionResult<ManagedLfpClan[]>> {
    const te = await getTranslations("AuthErrors")

    try {
        const session = await getSession()

        if (!session) return { success: false, error: te("unauthorized") }

        const memberships = await prisma.clanMember.findMany({
            where: { userId: session.userId, role: { in: ["LEADER", "OFFICER"] } },
            orderBy: { createdAt: "asc" },
            include: {
                clan: {
                    include: {
                        _count: { select: { members: true } },
                        lfpListing: true,
                        servers: { where: { server: { beganAt: getActiveServerRange() } }, include: { server: true } },
                    },
                },
            },
        })

        return {
            success: true,
            data: memberships.map(({ clan }) => {
                const servers = clan.servers
                    .map(({ server }) => ({ ...new ServerDto(server) }))
                    .sort((a, b) => b.beganAt.getTime() - a.beganAt.getTime())
                const activeIds = new Set(servers.map(({ id }) => id))
                const listing = clan.lfpListing

                return {
                    clan: { ...new ClanDto(clan) },
                    servers,
                    listing: listing && {
                        message: listing.message,
                        // LEADER is never saved, old listings have no rank.
                        role: lfpRoles.find((role) => role === listing.role) ?? "RECRUIT",
                        // Expired servers and servers the clan left are dropped.
                        serverIds: (listing.serverIds ?? []).filter((id) => activeIds.has(id)),
                    },
                }
            }),
        }
    } catch (error) {
        console.error("getMyLfpClans failed", error)

        return { success: false, error: te("unknown") }
    }
}
