"use server"

import { getTranslations } from "next-intl/server"
import { PlayerClanDto } from "@/dtos/clanMemberDTO"
import { PublicUserDto } from "@/dtos/userDTO"
import { getPlayerServers } from "@/lib/players/servers"
import { prisma } from "@/lib/prisma"
import { objectIdSchema } from "@/lib/schemas/auth.schema"
import type { ActionResult, PlayerDetail } from "@/types"

/** Returns a player with their clans and servers. */
export async function getPlayer(playerId: unknown): Promise<ActionResult<PlayerDetail>> {
    const t = await getTranslations("PlayerPage")

    const parsed = objectIdSchema.safeParse(playerId)

    if (!parsed.success) {
        return { success: false, error: t("notFound") }
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: parsed.data },
            omit: { password: true },
            include: {
                clanMemberships: {
                    orderBy: { createdAt: "asc" },
                    include: { clan: { include: { _count: { select: { members: true } } } } },
                },
            },
        })

        if (!user) {
            return { success: false, error: t("notFound") }
        }

        return {
            success: true,
            data: {
                player: { ...new PublicUserDto(user) },
                clans: user.clanMemberships.map((membership) => ({ ...new PlayerClanDto(membership) })),
                ...await getPlayerServers(user.id),
            },
        }
    } catch (error) {
        console.error("getPlayer failed", error)

        return { success: false, error: t("loadError") }
    }
}
