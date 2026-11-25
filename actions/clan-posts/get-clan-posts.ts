"use server"

import { getTranslations } from "next-intl/server"
import type { Prisma } from "@prisma/client"
import { ClanPostDto } from "@/dtos/clanPostDTO"
import { canDeletePost, canEditPost, getClanAccess } from "@/lib/clans/access"
import { prisma } from "@/lib/prisma"
import { objectIdSchema } from "@/lib/schemas/auth.schema"
import { clanPostQuerySchema } from "@/lib/schemas/clan-post-query.schema"
import { pageLimit } from "@/lib/src/constants"
import type { ActionResult, ClanPostList } from "@/types"

/**
 * Returns one page of the wall of a clan, newest post first. MEMBER posts are
 * only returned to members of the clan.
 */
export async function getClanPosts(clanId: unknown, input: unknown): Promise<ActionResult<ClanPostList>> {
    const t = await getTranslations("ClanWall")

    const parsedId = objectIdSchema.safeParse(clanId)
    const parsed = clanPostQuerySchema.safeParse(input)

    if (!parsedId.success || !parsed.success) {
        return { success: false, error: t("loadError") }
    }

    try {
        const access = await getClanAccess(parsedId.data)

        const where: Prisma.ClanPostWhereInput = { clanId: parsedId.data }

        if (!access?.isMember) where.visibility = "PUBLIC"

        const [posts, total] = await Promise.all([
            prisma.clanPost.findMany({
                where,
                orderBy: [{ createdAt: "desc" }, { id: "desc" }],
                skip: (parsed.data.page - 1) * pageLimit,
                take: pageLimit,
                include: { author: { omit: { password: true } } },
            }),
            prisma.clanPost.count({ where }),
        ])

        return {
            success: true,
            data: {
                posts: posts.map((post) => ({
                    ...new ClanPostDto(post, {
                        canEdit: canEditPost(access, post.authorId),
                        canDelete: canDeletePost(access, post.authorId),
                    }),
                })),
                total,
                pageCount: Math.max(1, Math.ceil(total / pageLimit)),
            },
        }
    } catch (error) {
        console.error("getClanPosts failed", error)

        return { success: false, error: t("loadError") }
    }
}
