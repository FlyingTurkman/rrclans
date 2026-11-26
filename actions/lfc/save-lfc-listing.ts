"use server"

import { getTranslations } from "next-intl/server"
import { getSession } from "@/lib/auth/session"
import { prisma } from "@/lib/prisma"
import { createLfcSchema, type LfcFormValues } from "@/lib/schemas/lfc.schema"
import { getActiveServersById } from "@/lib/servers/active"
import { toFieldErrors } from "@/lib/validation"
import type { ActionResult } from "@/types"

/** Creates or changes the listing of the logged-in user (one per player), for active servers. */
export async function saveLfcListing(input: LfcFormValues): Promise<ActionResult> {
    const t = await getTranslations("LfcPage")
    const tv = await getTranslations("Validation")
    const te = await getTranslations("AuthErrors")

    const parsed = createLfcSchema(tv).safeParse(input)

    if (!parsed.success) return { success: false, fieldErrors: toFieldErrors(parsed.error) }

    const { message, region, serverIds } = parsed.data

    try {
        const session = await getSession()

        if (!session) return { success: false, error: te("unauthorized") }

        const active = await getActiveServersById(serverIds)

        if (active.size !== serverIds.length) return { success: false, fieldErrors: { serverIds: t("serverNotActive") } }

        await prisma.lfcListing.upsert({
            where: { userId: session.userId },
            create: { userId: session.userId, message, region, serverIds },
            update: { message, region, serverIds },
        })

        return { success: true, data: undefined }
    } catch (error) {
        console.error("saveLfcListing failed", error)

        return { success: false, error: te("unknown") }
    }
}
