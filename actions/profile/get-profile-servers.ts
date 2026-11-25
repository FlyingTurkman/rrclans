"use server"

import { getTranslations } from "next-intl/server"
import { getSession } from "@/lib/auth/session"
import { getPlayerServers } from "@/lib/players/servers"
import type { ActionResult, PlayerServers } from "@/types"

/** Active server and server history of the logged-in user. */
export async function getProfileServers(): Promise<ActionResult<PlayerServers>> {
    const te = await getTranslations("AuthErrors")

    try {
        const session = await getSession()

        if (!session) return { success: false, error: te("unauthorized") }

        return { success: true, data: await getPlayerServers(session.userId) }
    } catch (error) {
        console.error("getProfileServers failed", error)

        return { success: false, error: te("unknown") }
    }
}
