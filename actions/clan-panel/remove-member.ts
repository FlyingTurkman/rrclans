"use server"

import { getTranslations } from "next-intl/server"
import { canManageMember, getClanAccess } from "@/lib/clans/access"
import { notifyUser } from "@/lib/notifications/clan"
import { prisma } from "@/lib/prisma"
import { objectIdSchema } from "@/lib/schemas/auth.schema"
import type { ActionResult } from "@/types"

/** Removes a member from a clan. Their wall posts stay. */
export async function removeMember(memberId: string): Promise<ActionResult> {
    const t = await getTranslations("ClanPanel")

    const parsed = objectIdSchema.safeParse(memberId)

    if (!parsed.success) return { success: false, error: t("memberNotFound") }

    try {
        const member = await prisma.clanMember.findUnique({ where: { id: parsed.data } })

        if (!member) return { success: false, error: t("memberNotFound") }

        const access = await getClanAccess(member.clanId)

        if (!canManageMember(access, member)) return { success: false, error: t("forbidden") }

        // See updateMemberRole: the rank may have changed meanwhile.
        const { count } = await prisma.clanMember.deleteMany({ where: { id: member.id, role: member.role } })

        if (count === 0) return { success: false, error: t("conflict") }

        await notifyUser(member.userId, { type: "CLAN_REMOVED", clanId: member.clanId })

        return { success: true, data: undefined }
    } catch (error) {
        console.error("removeMember failed", error)

        return { success: false, error: t("actionError") }
    }
}
