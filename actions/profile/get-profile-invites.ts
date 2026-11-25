"use server"

import { getTranslations } from "next-intl/server"
import { ProfileInviteDto } from "@/dtos/clanJoinDTO"
import { getSession } from "@/lib/auth/session"
import { prisma } from "@/lib/prisma"
import type { ActionResult } from "@/types"

/** Clan invites of the logged-in user, newest first. */
export async function getProfileInvites(): Promise<ActionResult<ProfileInviteDto[]>> {
    const te = await getTranslations("AuthErrors")

    try {
        const session = await getSession()

        if (!session) return { success: false, error: te("unauthorized") }

        const invites = await prisma.clanInvite.findMany({
            where: { userId: session.userId },
            orderBy: [{ createdAt: "desc" }, { id: "desc" }],
            include: { clan: { include: { _count: { select: { members: true } } } } },
        })

        return { success: true, data: invites.map((invite) => ({ ...new ProfileInviteDto(invite) })) }
    } catch (error) {
        console.error("getProfileInvites failed", error)

        return { success: false, error: te("unknown") }
    }
}
