"use server"

import { getTranslations } from "next-intl/server"
import { ClanDto } from "@/dtos/clanDTO"
import { ServerDto } from "@/dtos/serverDTO"
import { getClanAccess, getJoinStatus } from "@/lib/clans/access"
import { prisma } from "@/lib/prisma"
import { objectIdSchema } from "@/lib/schemas/auth.schema"
import { getActiveServerRange } from "@/lib/src/serverLifetime"
import type { ActionResult, ClanDetail } from "@/types"

/** Returns a clan with its active servers and what the user may do in it. */
export async function getClan(clanId: unknown): Promise<ActionResult<ClanDetail>> {
    const t = await getTranslations("ClanPage")

    const parsed = objectIdSchema.safeParse(clanId)

    if (!parsed.success) {
        return { success: false, error: t("notFound") }
    }

    try {
        const clan = await prisma.clan.findUnique({
            where: { id: parsed.data },
            include: {
                _count: { select: { members: true } },
                servers: {
                    where: { server: { beganAt: getActiveServerRange() } },
                    include: { server: true },
                },
            },
        })

        if (!clan) {
            return { success: false, error: t("notFound") }
        }

        // Newest server first.
        const servers = clan.servers
            .map(({ server }) => ({ ...new ServerDto(server) }))
            .sort((a, b) => b.beganAt.getTime() - a.beganAt.getTime())

        const access = await getClanAccess(clan.id)
        const joinStatus = await getJoinStatus(access, clan.id)

        return {
            success: true,
            data: {
                clan: { ...new ClanDto(clan) },
                servers,
                canManage: access?.isManager ?? false,
                viewerRole: access?.role ?? null,
                joinStatus,
            },
        }
    } catch (error) {
        console.error("getClan failed", error)

        return { success: false, error: t("loadError") }
    }
}
