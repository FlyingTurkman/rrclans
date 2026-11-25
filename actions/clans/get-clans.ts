"use server"

import { getTranslations } from "next-intl/server"
import type { Prisma } from "@prisma/client"
import { ClanDto } from "@/dtos/clanDTO"
import { prisma } from "@/lib/prisma"
import { clanQuerySchema } from "@/lib/schemas/clan-query.schema"
import { pageLimit } from "@/lib/src/constants"
import type { ListSort } from "@/lib/src/listSorts"
import type { ActionResult, ClanList } from "@/types"

// The id is a tie-breaker, so clans never repeat or go missing between pages.
const orderBy: Record<ListSort, Prisma.ClanOrderByWithRelationInput[]> = {
    newest: [{ createdAt: "desc" }, { id: "desc" }],
    oldest: [{ createdAt: "asc" }, { id: "asc" }],
    name: [{ clanName: "asc" }, { id: "asc" }],
}

/** Returns one page of clans filtered by the search params of /clans. */
export async function getClans(input: unknown): Promise<ActionResult<ClanList>> {
    const t = await getTranslations("ClansPage")

    const parsed = clanQuerySchema.safeParse(input)

    if (!parsed.success) {
        return { success: false, error: t("loadError") }
    }

    const { term, region, sort, page } = parsed.data

    const where: Prisma.ClanWhereInput = {}

    if (region) where.region = region

    if (term) {
        where.OR = [
            { clanName: { contains: term, mode: "insensitive" } },
            { clanTag: { contains: term, mode: "insensitive" } },
        ]
    }

    try {
        const [clans, total] = await Promise.all([
            prisma.clan.findMany({
                where,
                orderBy: orderBy[sort],
                skip: (page - 1) * pageLimit,
                take: pageLimit,
                include: { _count: { select: { members: true } } },
            }),
            prisma.clan.count({ where }),
        ])

        return {
            success: true,
            data: {
                clans: clans.map((clan) => ({ ...new ClanDto(clan) })),
                total,
                pageCount: Math.max(1, Math.ceil(total / pageLimit)),
            },
        }
    } catch (error) {
        console.error("getClans failed", error)

        return { success: false, error: t("loadError") }
    }
}
