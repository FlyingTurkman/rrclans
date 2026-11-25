"use server"

import { getTranslations } from "next-intl/server"
import { serializeToHtml } from "@/components/rte/rte-engine"
import { canEditPost, getClanAccess } from "@/lib/clans/access"
import { prisma } from "@/lib/prisma"
import { objectIdSchema } from "@/lib/schemas/auth.schema"
import { createClanPostSchema, type ClanPostFormValues } from "@/lib/schemas/clan-post.schema"
import { toFieldErrors } from "@/lib/validation"
import type { ActionResult } from "@/types"

/** Changes a post (its author). */
export async function updateClanPost(postId: string, input: ClanPostFormValues): Promise<ActionResult> {
    const t = await getTranslations("ClanWall")
    const tv = await getTranslations("Validation")

    const parsedId = objectIdSchema.safeParse(postId)
    const parsed = createClanPostSchema(tv).safeParse(input)

    if (!parsedId.success) return { success: false, error: t("notFound") }
    if (!parsed.success) return { success: false, fieldErrors: toFieldErrors(parsed.error) }

    try {
        const post = await prisma.clanPost.findUnique({
            where: { id: parsedId.data },
            select: { clanId: true, authorId: true },
        })

        if (!post) return { success: false, error: t("notFound") }

        const access = await getClanAccess(post.clanId)

        if (!canEditPost(access, post.authorId)) return { success: false, error: t("forbidden") }

        const { title, visibility, rawContent } = parsed.data

        await prisma.clanPost.update({
            where: { id: parsedId.data },
            data: { title, visibility, rawContent, content: serializeToHtml(rawContent) },
        })

        return { success: true, data: undefined }
    } catch (error) {
        console.error("updateClanPost failed", error)

        return { success: false, error: t("actionError") }
    }
}
