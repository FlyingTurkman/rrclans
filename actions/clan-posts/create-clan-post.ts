"use server"

import { getTranslations } from "next-intl/server"
import { serializeToHtml } from "@/components/rte/rte-engine"
import { getClanAccess } from "@/lib/clans/access"
import { prisma } from "@/lib/prisma"
import { objectIdSchema } from "@/lib/schemas/auth.schema"
import { createClanPostSchema, type ClanPostFormValues } from "@/lib/schemas/clan-post.schema"
import { toFieldErrors } from "@/lib/validation"
import type { ActionResult } from "@/types"

/** Adds a post to the wall of a clan (leader and officers). */
export async function createClanPost(clanId: string, input: ClanPostFormValues): Promise<ActionResult> {
    const t = await getTranslations("ClanWall")
    const tv = await getTranslations("Validation")

    const parsedId = objectIdSchema.safeParse(clanId)
    const parsed = createClanPostSchema(tv).safeParse(input)

    if (!parsedId.success) return { success: false, error: t("actionError") }
    if (!parsed.success) return { success: false, fieldErrors: toFieldErrors(parsed.error) }

    try {
        const access = await getClanAccess(parsedId.data)

        if (!access?.isManager) return { success: false, error: t("forbidden") }

        const { title, visibility, rawContent } = parsed.data

        await prisma.clanPost.create({
            data: {
                clanId: parsedId.data,
                authorId: access.userId,
                title,
                visibility,
                rawContent,
                content: serializeToHtml(rawContent),
            },
        })

        return { success: true, data: undefined }
    } catch (error) {
        console.error("createClanPost failed", error)

        return { success: false, error: t("actionError") }
    }
}
