"use server"

import { getTranslations } from "next-intl/server"
import { getClanAccess } from "@/lib/clans/access"
import { addClanMember, claimRequest } from "@/lib/clans/join"
import { notifyUser } from "@/lib/notifications/clan"
import { prisma } from "@/lib/prisma"
import { objectIdSchema } from "@/lib/schemas/auth.schema"
import type { ActionResult } from "@/types"

/** Accepts or rejects a join request (leader and officers). */
export async function answerJoinRequest(requestId: string, isAccepted: boolean): Promise<ActionResult> {
    const t = await getTranslations("ClanPanel")

    const parsed = objectIdSchema.safeParse(requestId)

    if (!parsed.success) return { success: false, error: t("requestNotFound") }

    try {
        const request = await prisma.clanJoinRequest.findUnique({ where: { id: parsed.data } })

        if (!request) return { success: false, error: t("requestNotFound") }

        const { clanId, userId } = request
        const access = await getClanAccess(clanId)

        if (!access?.isManager) return { success: false, error: t("forbidden") }

        if (isAccepted === true) {
            // False if the player has cancelled the request meanwhile.
            const isAdded = await addClanMember(clanId, userId, (tx) => claimRequest(tx, clanId, userId))

            if (!isAdded) return { success: false, error: t("requestNotFound") }

            await notifyUser(userId, { type: "CLAN_REQUEST_ACCEPTED", clanId, href: `/c/${clanId}` })
        } else {
            const { count } = await prisma.clanJoinRequest.deleteMany({ where: { id: request.id } })

            if (count > 0) await notifyUser(userId, { type: "CLAN_REQUEST_REJECTED", clanId })
        }

        return { success: true, data: undefined }
    } catch (error) {
        console.error("answerJoinRequest failed", error)

        return { success: false, error: t("actionError") }
    }
}
