"use server"

import { getTranslations } from "next-intl/server"
import { getSession } from "@/lib/auth/session"
import { setPlayerLocation } from "@/lib/players/servers"
import { objectIdSchema } from "@/lib/schemas/auth.schema"
import { createPlayerLocationSchema, type PlayerLocationFormValues } from "@/lib/schemas/player-location.schema"
import { toFieldErrors } from "@/lib/validation"
import type { ActionResult } from "@/types"

/** Saves the location of the logged-in user on their active server. */
export async function setProfileLocation(serverId: string, input: PlayerLocationFormValues): Promise<ActionResult> {
    const t = await getTranslations("ProfilePage")
    const tv = await getTranslations("Validation")
    const te = await getTranslations("AuthErrors")

    const parsedId = objectIdSchema.safeParse(serverId)

    if (!parsedId.success) return { success: false, error: t("serverErrors.notFound") }

    const parsed = createPlayerLocationSchema(tv).safeParse(input)

    if (!parsed.success) return { success: false, fieldErrors: toFieldErrors(parsed.error) }

    const { district, settlement } = parsed.data

    try {
        const session = await getSession()

        if (!session) return { success: false, error: te("unauthorized") }

        const result = await setPlayerLocation(session.userId, parsedId.data, { district, settlement: Number(settlement) })

        if (result !== "set") return { success: false, error: t(`serverErrors.${result}`) }

        return { success: true, data: undefined }
    } catch (error) {
        console.error("setProfileLocation failed", error)

        return { success: false, error: te("unknown") }
    }
}
