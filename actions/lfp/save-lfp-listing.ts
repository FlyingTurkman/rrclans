"use server"

import { getTranslations } from "next-intl/server"
import { getClanAccess } from "@/lib/clans/access"
import { prisma } from "@/lib/prisma"
import { objectIdSchema } from "@/lib/schemas/auth.schema"
import { createLfpSchema, type LfpFormValues } from "@/lib/schemas/lfp.schema"
import { toFieldErrors } from "@/lib/validation"
import type { ActionResult } from "@/types"

/** Creates or changes the listing of a clan (leader and officers, one per clan). */
export async function saveLfpListing(clanId: string, input: LfpFormValues): Promise<ActionResult> {
    const t = await getTranslations("LfpPage")
    const tv = await getTranslations("Validation")
    const te = await getTranslations("AuthErrors")

    const parsedId = objectIdSchema.safeParse(clanId)
    const parsed = createLfpSchema(tv).safeParse(input)

    if (!parsedId.success) return { success: false, error: te("unknown") }
    if (!parsed.success) return { success: false, fieldErrors: toFieldErrors(parsed.error) }

    const { message } = parsed.data

    try {
        const access = await getClanAccess(parsedId.data)

        if (!access?.isManager) return { success: false, error: t("forbidden") }

        await prisma.lfpListing.upsert({
            where: { clanId: parsedId.data },
            create: { clanId: parsedId.data, message },
            update: { message },
        })

        return { success: true, data: undefined }
    } catch (error) {
        console.error("saveLfpListing failed", error)

        return { success: false, error: te("unknown") }
    }
}
