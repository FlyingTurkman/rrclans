"use server"

import { getTranslations } from "next-intl/server"
import { canManageMember, getClanAccess } from "@/lib/clans/access"
import { notifyUser } from "@/lib/notifications/clan"
import { prisma } from "@/lib/prisma"
import { memberRoleSchema } from "@/lib/schemas/clan-member.schema"
import { canManageRole } from "@/lib/src/clanPermissions"
import { getRoleData } from "@/lib/src/clanRoles"
import type { ActionResult } from "@/types"

/** Changes the rank of a clan member. */
export async function updateMemberRole(memberId: string, role: string): Promise<ActionResult> {
    const t = await getTranslations("ClanPanel")

    const parsed = memberRoleSchema.safeParse({ memberId, role })

    if (!parsed.success) return { success: false, error: t("actionError") }

    try {
        const member = await prisma.clanMember.findUnique({ where: { id: parsed.data.memberId } })

        if (!member) return { success: false, error: t("memberNotFound") }

        const access = await getClanAccess(member.clanId)

        // Both the current and the new rank must be below the own rank.
        if (!canManageMember(access, member) || !canManageRole(access?.role ?? null, parsed.data.role)) {
            return { success: false, error: t("forbidden") }
        }

        // The old rank is part of the filter: if somebody else changed it
        // meanwhile, the check above no longer holds.
        const { count } = await prisma.clanMember.updateMany({
            where: { id: member.id, role: member.role },
            data: getRoleData(parsed.data.role),
        })

        if (count === 0) return { success: false, error: t("conflict") }

        await notifyUser(member.userId, {
            type: "CLAN_ROLE_CHANGED",
            clanId: member.clanId,
            role: parsed.data.role,
            href: `/c/${member.clanId}`,
        })

        return { success: true, data: undefined }
    } catch (error) {
        console.error("updateMemberRole failed", error)

        return { success: false, error: t("actionError") }
    }
}
