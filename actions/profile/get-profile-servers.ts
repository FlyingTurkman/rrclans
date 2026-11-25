"use server"

import { getTranslations } from "next-intl/server"
import { getSession } from "@/lib/auth/session"
import { getPlayerLocation, getPlayerServers } from "@/lib/players/servers"
import type { ActionResult, ProfileServers } from "@/types"

/** Active server, location on it and server history of the logged-in user. */
export async function getProfileServers(): Promise<ActionResult<ProfileServers>> {
    const te = await getTranslations("AuthErrors")

    try {
        const session = await getSession()

        if (!session) return { success: false, error: te("unauthorized") }

        const servers = await getPlayerServers(session.userId)
        const location = servers.server ? await getPlayerLocation(session.userId, servers.server.id) : null

        return { success: true, data: { ...servers, location } }
    } catch (error) {
        console.error("getProfileServers failed", error)

        return { success: false, error: te("unknown") }
    }
}
