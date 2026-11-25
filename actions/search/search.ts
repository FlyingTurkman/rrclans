"use server"

import { getTranslations } from "next-intl/server"
import { ClanDto } from "@/dtos/clanDTO"
import { PublicUserDto } from "@/dtos/userDTO"
import { prisma } from "@/lib/prisma"
import { searchSchema } from "@/lib/schemas/search.schema"
import { searchLimit } from "@/lib/src/constants"
import type { ActionResult, SearchResults } from "@/types"

/** Finds clans and players by name (main menu search bar). */
export async function search(input: unknown): Promise<ActionResult<SearchResults>> {
    const t = await getTranslations("Search")

    const parsed = searchSchema.safeParse(input)

    if (!parsed.success) {
        return { success: false, error: t("loadError") }
    }

    const { term } = parsed.data

    if (!term) {
        return { success: true, data: { clans: [], players: [] } }
    }

    try {
        const [clans, users] = await Promise.all([
            prisma.clan.findMany({
                where: {
                    OR: [
                        { clanName: { contains: term, mode: "insensitive" } },
                        { clanTag: { contains: term, mode: "insensitive" } },
                    ],
                },
                orderBy: [{ clanName: "asc" }, { id: "asc" }],
                take: searchLimit,
                include: { _count: { select: { members: true } } },
            }),
            // Only public names are searched, never the email or the real name.
            prisma.user.findMany({
                where: {
                    OR: [
                        { username: { contains: term, mode: "insensitive" } },
                        { steamUsername: { contains: term, mode: "insensitive" } },
                    ],
                },
                orderBy: [{ username: "asc" }, { id: "asc" }],
                take: searchLimit,
                omit: { password: true },
            }),
        ])

        return {
            success: true,
            data: {
                clans: clans.map((clan) => ({ ...new ClanDto(clan) })),
                players: users.map((user) => ({ ...new PublicUserDto(user) })),
            },
        }
    } catch (error) {
        console.error("search failed", error)

        return { success: false, error: t("loadError") }
    }
}
