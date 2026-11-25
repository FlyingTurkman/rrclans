"use server"

import { getTranslations } from "next-intl/server"
import type { ServerDto } from "@/dtos/serverDTO"
import { serverSearchSchema } from "@/lib/schemas/server-search.schema"
import { findActiveServers } from "@/lib/servers/search"
import type { ActionResult } from "@/types"

/** Searches the active servers by name. */
export async function searchServers(input: unknown): Promise<ActionResult<ServerDto[]>> {
    const t = await getTranslations("ServerSearch")

    const parsed = serverSearchSchema.safeParse(input)

    if (!parsed.success) return { success: false, error: t("loadError") }

    try {
        return { success: true, data: await findActiveServers(parsed.data.term) }
    } catch (error) {
        console.error("searchServers failed", error)

        return { success: false, error: t("loadError") }
    }
}
