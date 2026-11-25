"use server"

import { getTranslations } from "next-intl/server"
import { getClanAccess } from "@/lib/clans/access"
import { prisma } from "@/lib/prisma"
import { objectIdSchema } from "@/lib/schemas/auth.schema"
import type { ActionResult } from "@/types"

/** Takes back an invite (leader and officers). */
export async function cancelInvite(inviteId: string): Promise<ActionResult> {
    const t = await getTranslations("ClanPanel")

    const parsed = objectIdSchema.safeParse(inviteId)

    if (!parsed.success) return { success: false, error: t("inviteNotFound") }

    try {
        const invite = await prisma.clanInvite.findUnique({ where: { id: parsed.data }, select: { id: true, clanId: true } })

        if (!invite) return { success: false, error: t("inviteNotFound") }

        const access = await getClanAccess(invite.clanId)

        if (!access?.isManager) return { success: false, error: t("forbidden") }

        await prisma.clanInvite.deleteMany({ where: { id: invite.id } })

        return { success: true, data: undefined }
    } catch (error) {
        console.error("cancelInvite failed", error)

        return { success: false, error: t("actionError") }
    }
}
