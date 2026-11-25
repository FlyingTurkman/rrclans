"use server"

import { getTranslations } from "next-intl/server"
import { getClanAccess } from "@/lib/clans/access"
import { prisma } from "@/lib/prisma"
import { objectIdSchema } from "@/lib/schemas/auth.schema"
import { clanAvatarSchema } from "@/lib/schemas/clan-avatar.schema"
import type { ClanAvatarId } from "@/lib/src/clanAvatars"
import { canChangeAvatar } from "@/lib/src/clanPermissions"
import type { ActionResult } from "@/types"

/** Changes the avatar of a clan, null removes it (only the leader). */
export async function updateClanAvatar(clanId: string, avatar: ClanAvatarId | null): Promise<ActionResult> {
    const t = await getTranslations("ClanPanel")

    const parsedId = objectIdSchema.safeParse(clanId)
    const parsed = clanAvatarSchema.safeParse(avatar)

    if (!parsedId.success || !parsed.success) return { success: false, error: t("actionError") }

    try {
        const access = await getClanAccess(parsedId.data)

        if (!canChangeAvatar(access?.role ?? null)) return { success: false, error: t("forbidden") }

        await prisma.clan.update({ where: { id: parsedId.data }, data: { avatar: parsed.data } })

        return { success: true, data: undefined }
    } catch (error) {
        console.error("updateClanAvatar failed", error)

        return { success: false, error: t("actionError") }
    }
}
