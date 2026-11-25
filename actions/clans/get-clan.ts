"use server"

import { getTranslations } from "next-intl/server"
import { ClanDto } from "@/dtos/clanDTO"
import { ClanMemberDto } from "@/dtos/clanMemberDTO"
import { ServerDto } from "@/dtos/serverDTO"
import { getClanAccess } from "@/lib/clans/access"
import { prisma } from "@/lib/prisma"
import { objectIdSchema } from "@/lib/schemas/auth.schema"
import { clanRoles } from "@/lib/src/clanRoles"
import { getActiveServerRange } from "@/lib/src/serverLifetime"
import type { ActionResult, ClanDetail } from "@/types"

/** Returns a clan with its active servers and its members, highest rank first. */
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
                members: {
                    orderBy: { createdAt: "asc" },
                    include: { user: { omit: { password: true } } },
                },
                servers: {
                    where: { server: { beganAt: getActiveServerRange() } },
                    include: { server: true },
                },
            },
        })

        if (!clan) {
            return { success: false, error: t("notFound") }
        }

        // MongoDB would sort the ranks alphabetically. The sort is stable, so
        // members of the same rank stay ordered by join date.
        const members = clan.members
            .map((member) => ({ ...new ClanMemberDto(member) }))
            .sort((a, b) => clanRoles.indexOf(a.role) - clanRoles.indexOf(b.role))

        // Newest server first.
        const servers = clan.servers
            .map(({ server }) => ({ ...new ServerDto(server) }))
            .sort((a, b) => b.beganAt.getTime() - a.beganAt.getTime())

        const access = await getClanAccess(clan.id)

        return {
            success: true,
            data: { clan: { ...new ClanDto(clan) }, servers, canManage: access?.isManager ?? false, members },
        }
    } catch (error) {
        console.error("getClan failed", error)

        return { success: false, error: t("loadError") }
    }
}
