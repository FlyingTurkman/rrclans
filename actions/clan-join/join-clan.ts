"use server"

import { getTranslations } from "next-intl/server"
import { Prisma } from "@prisma/client"
import { getClanAccess } from "@/lib/clans/access"
import { addClanMember, claimInvite } from "@/lib/clans/join"
import { notifyClanManagers } from "@/lib/notifications/clan"
import { prisma } from "@/lib/prisma"
import { objectIdSchema } from "@/lib/schemas/auth.schema"
import type { ActionResult, ClanJoinStatus } from "@/types"

/**
 * Joins a clan in the way its join mode allows: accepts the invite of the
 * user, becomes a member (OPEN) or sends a request (REQUEST). The mode is read
 * here, never taken from the client.
 */
export async function joinClan(clanId: string): Promise<ActionResult<ClanJoinStatus>> {
    const t = await getTranslations("ClanJoin")

    const parsed = objectIdSchema.safeParse(clanId)

    if (!parsed.success) return { success: false, error: t("notFound") }

    try {
        const [access, clan] = await Promise.all([
            getClanAccess(parsed.data),
            prisma.clan.findUnique({ where: { id: parsed.data }, select: { id: true, joinMode: true } }),
        ])

        if (!access) return { success: false, error: t("unauthorized") }
        if (!clan) return { success: false, error: t("notFound") }
        if (access.isMember) return { success: true, data: "MEMBER" }

        const { userId } = access

        const joined = { type: "CLAN_MEMBER_JOINED", clanId: clan.id, playerId: userId, href: `/c/${clan.id}/members` } as const

        if (await addClanMember(clan.id, userId, (tx) => claimInvite(tx, clan.id, userId))) {
            await notifyClanManagers(joined)

            return { success: true, data: "MEMBER" }
        }

        if (clan.joinMode === "INVITE") return { success: false, error: t("inviteOnly") }

        if (clan.joinMode === "OPEN") {
            // Still open? The mode may have changed since it was read.
            const isJoined = await addClanMember(clan.id, userId, async (tx) => {
                return await tx.clan.count({ where: { id: clan.id, joinMode: "OPEN" } }) > 0
            })

            if (!isJoined) return { success: false, error: t("modeChanged") }

            await notifyClanManagers(joined)

            return { success: true, data: "MEMBER" }
        }

        await prisma.clanJoinRequest.create({ data: { clanId: clan.id, userId } })
        await notifyClanManagers({ type: "CLAN_JOIN_REQUEST", clanId: clan.id, playerId: userId, href: `/c/${clan.id}/panel/joins` })

        return { success: true, data: "REQUESTED" }
    } catch (error) {
        // The request already exists.
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
            return { success: true, data: "REQUESTED" }
        }

        console.error("joinClan failed", error)

        return { success: false, error: t("actionError") }
    }
}
