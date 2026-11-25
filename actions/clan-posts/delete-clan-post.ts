"use server"

import { getTranslations } from "next-intl/server"
import { canDeletePost, getClanAccess } from "@/lib/clans/access"
import { prisma } from "@/lib/prisma"
import { objectIdSchema } from "@/lib/schemas/auth.schema"
import type { ActionResult } from "@/types"

/** Deletes a post (author, leader, officers, site MOD and ADMIN). */
export async function deleteClanPost(postId: string): Promise<ActionResult> {
    const t = await getTranslations("ClanWall")

    const parsedId = objectIdSchema.safeParse(postId)

    if (!parsedId.success) return { success: false, error: t("notFound") }

    try {
        const post = await prisma.clanPost.findUnique({
            where: { id: parsedId.data },
            select: { clanId: true, authorId: true },
        })

        if (!post) return { success: false, error: t("notFound") }

        const access = await getClanAccess(post.clanId)

        if (!canDeletePost(access, post.authorId)) return { success: false, error: t("forbidden") }

        await prisma.clanPost.deleteMany({ where: { id: parsedId.data } })

        return { success: true, data: undefined }
    } catch (error) {
        console.error("deleteClanPost failed", error)

        return { success: false, error: t("actionError") }
    }
}
