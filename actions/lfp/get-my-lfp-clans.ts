"use server"

import { getTranslations } from "next-intl/server"
import { ClanDto } from "@/dtos/clanDTO"
import { getSession } from "@/lib/auth/session"
import { prisma } from "@/lib/prisma"
import type { ActionResult, ManagedLfpClan } from "@/types"

/** Clans whose listing the logged-in user manages (leader and officers). */
export async function getMyLfpClans(): Promise<ActionResult<ManagedLfpClan[]>> {
    const te = await getTranslations("AuthErrors")

    try {
        const session = await getSession()

        if (!session) return { success: false, error: te("unauthorized") }

        const memberships = await prisma.clanMember.findMany({
            where: { userId: session.userId, role: { in: ["LEADER", "OFFICER"] } },
            orderBy: { createdAt: "asc" },
            include: { clan: { include: { _count: { select: { members: true } }, lfpListing: { select: { message: true } } } } },
        })

        return {
            success: true,
            data: memberships.map(({ clan }) => ({
                clan: { ...new ClanDto(clan) },
                message: clan.lfpListing?.message ?? null,
            })),
        }
    } catch (error) {
        console.error("getMyLfpClans failed", error)

        return { success: false, error: te("unknown") }
    }
}
