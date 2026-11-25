"use server"

import { getTranslations } from "next-intl/server"
import { getClanAccess } from "@/lib/clans/access"
import { addServerToClan } from "@/lib/clans/servers"
import { objectIdSchema } from "@/lib/schemas/auth.schema"
import type { ActionResult } from "@/types"

/** Adds an active server to a clan (leader and officers). */
export async function addClanServer(clanId: string, serverId: string): Promise<ActionResult> {
    const t = await getTranslations("ClanServers")

    const parsedClanId = objectIdSchema.safeParse(clanId)
    const parsedServerId = objectIdSchema.safeParse(serverId)

    if (!parsedClanId.success || !parsedServerId.success) return { success: false, error: t("notFound") }

    try {
        const access = await getClanAccess(parsedClanId.data)

        if (!access?.isManager) return { success: false, error: t("forbidden") }

        const result = await addServerToClan(parsedClanId.data, parsedServerId.data)

        if (result !== "added") return { success: false, error: t(result) }

        return { success: true, data: undefined }
    } catch (error) {
        console.error("addClanServer failed", error)

        return { success: false, error: t("actionError") }
    }
}
