"use server"

import { getTranslations } from "next-intl/server"
import type { Prisma } from "@prisma/client"
import { PublicUserDto } from "@/dtos/userDTO"
import { prisma } from "@/lib/prisma"
import { playerQuerySchema } from "@/lib/schemas/player-query.schema"
import { pageLimit } from "@/lib/src/constants"
import type { ListSort } from "@/lib/src/listSorts"
import type { ActionResult, PlayerList } from "@/types"

// The id is a tie-breaker, so players never repeat or go missing between pages.
const orderBy: Record<ListSort, Prisma.UserOrderByWithRelationInput[]> = {
    newest: [{ createdAt: "desc" }, { id: "desc" }],
    oldest: [{ createdAt: "asc" }, { id: "asc" }],
    name: [{ username: "asc" }, { id: "asc" }],
}

/** Returns one page of players filtered by the search params of /players. */
export async function getPlayers(input: unknown): Promise<ActionResult<PlayerList>> {
    const t = await getTranslations("PlayersPage")

    const parsed = playerQuerySchema.safeParse(input)

    if (!parsed.success) {
        return { success: false, error: t("loadError") }
    }

    const { term, sort, page } = parsed.data

    const where: Prisma.UserWhereInput = {}

    // Only public names are searched, never the email or the real name.
    if (term) {
        where.OR = [
            { username: { contains: term, mode: "insensitive" } },
            { steamUsername: { contains: term, mode: "insensitive" } },
        ]
    }

    try {
        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                orderBy: orderBy[sort],
                skip: (page - 1) * pageLimit,
                take: pageLimit,
                omit: { password: true },
            }),
            prisma.user.count({ where }),
        ])

        return {
            success: true,
            data: {
                players: users.map((user) => ({ ...new PublicUserDto(user) })),
                total,
                pageCount: Math.max(1, Math.ceil(total / pageLimit)),
            },
        }
    } catch (error) {
        console.error("getPlayers failed", error)

        return { success: false, error: t("loadError") }
    }
}
