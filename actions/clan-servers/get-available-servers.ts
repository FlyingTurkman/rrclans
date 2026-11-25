"use server"

import { getTranslations } from "next-intl/server"
import type { ServerDto } from "@/dtos/serverDTO"
import { getClanAccess } from "@/lib/clans/access"
import { objectIdSchema } from "@/lib/schemas/auth.schema"
import { serverSearchSchema } from "@/lib/schemas/server-search.schema"
import { findActiveServers } from "@/lib/servers/search"
import type { ActionResult } from "@/types"

/** Searches the active servers that are not in the clan yet (leader and officers). */
export async function getAvailableServers(clanId: string, input: unknown): Promise<ActionResult<ServerDto[]>> {
    const t = await getTranslations("ClanServers")

    const parsedId = objectIdSchema.safeParse(clanId)
    const parsed = serverSearchSchema.safeParse(input)

    if (!parsedId.success || !parsed.success) return { success: false, error: t("actionError") }

    try {
        const access = await getClanAccess(parsedId.data)

        if (!access?.isManager) return { success: false, error: t("forbidden") }

        const servers = await findActiveServers(parsed.data.term, { clans: { none: { clanId: parsedId.data } } })

        return { success: true, data: servers }
    } catch (error) {
        console.error("getAvailableServers failed", error)

        return { success: false, error: t("actionError") }
    }
}
