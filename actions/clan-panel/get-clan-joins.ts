"use server"

import { getTranslations } from "next-intl/server"
import { ClanJoinDto } from "@/dtos/clanJoinDTO"
import { getClanAccess } from "@/lib/clans/access"
import { prisma } from "@/lib/prisma"
import { objectIdSchema } from "@/lib/schemas/auth.schema"
import type { ActionResult, ClanJoins } from "@/types"

/** Pending join requests and invites of a clan (leader and officers). */
export async function getClanJoins(clanId: string): Promise<ActionResult<ClanJoins>> {
    const t = await getTranslations("ClanPanel")

    const parsed = objectIdSchema.safeParse(clanId)

    if (!parsed.success) return { success: false, error: t("actionError") }

    try {
        const access = await getClanAccess(parsed.data)

        if (!access?.isManager) return { success: false, error: t("forbidden") }

        const query = {
            where: { clanId: parsed.data },
            orderBy: [{ createdAt: "asc" as const }, { id: "asc" as const }],
            include: { user: { omit: { password: true as const } } },
        }

        const [requests, invites] = await Promise.all([
            prisma.clanJoinRequest.findMany(query),
            prisma.clanInvite.findMany(query),
        ])

        return {
            success: true,
            data: {
                requests: requests.map((request) => ({ ...new ClanJoinDto(request) })),
                invites: invites.map((invite) => ({ ...new ClanJoinDto(invite) })),
            },
        }
    } catch (error) {
        console.error("getClanJoins failed", error)

        return { success: false, error: t("actionError") }
    }
}
