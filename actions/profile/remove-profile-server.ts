"use server"

import { getTranslations } from "next-intl/server"
import { getSession } from "@/lib/auth/session"
import { leavePlayerServer } from "@/lib/players/servers"
import type { ActionResult } from "@/types"

/** Leaves the active server of the logged-in user, it stays as history. */
export async function removeProfileServer(): Promise<ActionResult> {
    const te = await getTranslations("AuthErrors")

    try {
        const session = await getSession()

        if (!session) return { success: false, error: te("unauthorized") }

        await leavePlayerServer(session.userId)

        return { success: true, data: undefined }
    } catch (error) {
        console.error("removeProfileServer failed", error)

        return { success: false, error: te("unknown") }
    }
}
