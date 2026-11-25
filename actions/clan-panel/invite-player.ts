"use server"

import { getTranslations } from "next-intl/server"
import { Prisma } from "@prisma/client"
import { getClanAccess } from "@/lib/clans/access"
import { addClanMember, claimRequest } from "@/lib/clans/join"
import { notifyUser } from "@/lib/notifications/clan"
import { prisma } from "@/lib/prisma"
import { objectIdSchema } from "@/lib/schemas/auth.schema"
import type { ActionResult } from "@/types"

/**
 * Invites a player to a clan (leader and officers, in every join mode). A
 * player who has already asked to join becomes a member right away.
 */
export async function invitePlayer(clanId: string, userId: string): Promise<ActionResult> {
    const t = await getTranslations("ClanPanel")

    const parsedClanId = objectIdSchema.safeParse(clanId)
    const parsedUserId = objectIdSchema.safeParse(userId)

    if (!parsedClanId.success || !parsedUserId.success) return { success: false, error: t("playerNotFound") }

    const target = { clanId: parsedClanId.data, userId: parsedUserId.data }

    try {
        const access = await getClanAccess(target.clanId)

        if (!access?.isManager) return { success: false, error: t("forbidden") }

        const user = await prisma.user.findUnique({
            where: { id: target.userId },
            select: { clanMemberships: { where: { clanId: target.clanId }, select: { id: true } } },
        })

        if (!user) return { success: false, error: t("playerNotFound") }
        if (user.clanMemberships.length > 0) return { success: false, error: t("alreadyMember") }

        if (await addClanMember(target.clanId, target.userId, (tx) => claimRequest(tx, target.clanId, target.userId))) {
            await notifyUser(target.userId, { type: "CLAN_REQUEST_ACCEPTED", clanId: target.clanId, href: `/c/${target.clanId}` })

            return { success: true, data: undefined }
        }

        await prisma.clanInvite.create({ data: target })
        await notifyUser(target.userId, { type: "CLAN_INVITE", clanId: target.clanId, href: `/c/${target.clanId}` })

        return { success: true, data: undefined }
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
            return { success: false, error: t("alreadyInvited") }
        }

        console.error("invitePlayer failed", error)

        return { success: false, error: t("actionError") }
    }
}
