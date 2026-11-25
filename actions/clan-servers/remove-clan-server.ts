"use server"

import { getTranslations } from "next-intl/server"
import { getClanAccess } from "@/lib/clans/access"
import { removeServerFromClan } from "@/lib/clans/servers"
import { objectIdSchema } from "@/lib/schemas/auth.schema"
import type { ActionResult } from "@/types"

/** Removes a server from a clan (leader and officers). */
export async function removeClanServer(clanId: string, serverId: string): Promise<ActionResult> {
    const t = await getTranslations("ClanServers")

    const parsedClanId = objectIdSchema.safeParse(clanId)
    const parsedServerId = objectIdSchema.safeParse(serverId)

    if (!parsedClanId.success || !parsedServerId.success) return { success: false, error: t("notFound") }

    try {
        const access = await getClanAccess(parsedClanId.data)

        if (!access?.isManager) return { success: false, error: t("forbidden") }

        await removeServerFromClan(parsedClanId.data, parsedServerId.data)

        return { success: true, data: undefined }
    } catch (error) {
        console.error("removeClanServer failed", error)

        return { success: false, error: t("actionError") }
    }
}
