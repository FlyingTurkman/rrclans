"use server"

import { getTranslations } from "next-intl/server"
import { getSession } from "@/lib/auth/session"
import { setPlayerServer } from "@/lib/players/servers"
import { objectIdSchema } from "@/lib/schemas/auth.schema"
import type { ActionResult } from "@/types"

/** Assigns the logged-in user to an active server, instead of the old one. */
export async function setProfileServer(serverId: string): Promise<ActionResult> {
    const t = await getTranslations("ProfilePage")
    const te = await getTranslations("AuthErrors")

    const parsed = objectIdSchema.safeParse(serverId)

    if (!parsed.success) return { success: false, error: t("serverErrors.notFound") }

    try {
        const session = await getSession()

        if (!session) return { success: false, error: te("unauthorized") }

        const result = await setPlayerServer(session.userId, parsed.data)

        if (result !== "set") return { success: false, error: t(`serverErrors.${result}`) }

        return { success: true, data: undefined }
    } catch (error) {
        console.error("setProfileServer failed", error)

        return { success: false, error: te("unknown") }
    }
}
