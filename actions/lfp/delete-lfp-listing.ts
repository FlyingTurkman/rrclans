"use server"

import { getTranslations } from "next-intl/server"
import { getClanAccess } from "@/lib/clans/access"
import { prisma } from "@/lib/prisma"
import { objectIdSchema } from "@/lib/schemas/auth.schema"
import type { ActionResult } from "@/types"

/** Deletes the listing of a clan (leader and officers). */
export async function deleteLfpListing(clanId: string): Promise<ActionResult> {
    const t = await getTranslations("LfpPage")
    const te = await getTranslations("AuthErrors")

    const parsedId = objectIdSchema.safeParse(clanId)

    if (!parsedId.success) return { success: false, error: te("unknown") }

    try {
        const access = await getClanAccess(parsedId.data)

        if (!access?.isManager) return { success: false, error: t("forbidden") }

        await prisma.lfpListing.deleteMany({ where: { clanId: parsedId.data } })

        return { success: true, data: undefined }
    } catch (error) {
        console.error("deleteLfpListing failed", error)

        return { success: false, error: te("unknown") }
    }
}
