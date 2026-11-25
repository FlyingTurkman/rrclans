"use server"

import { getTranslations } from "next-intl/server"
import type { Prisma } from "@prisma/client"
import { ClanMemberDto } from "@/dtos/clanMemberDTO"
import { prisma } from "@/lib/prisma"
import { objectIdSchema } from "@/lib/schemas/auth.schema"
import { clanMemberQuerySchema } from "@/lib/schemas/clan-member-query.schema"
import { pageLimit } from "@/lib/src/constants"
import type { MemberSort } from "@/lib/src/listSorts"
import { getActiveServerRange } from "@/lib/src/serverLifetime"
import type { ActionResult, ClanMemberList } from "@/types"

// Newest and oldest use the join date. The id is a tie-breaker, so members
// never repeat or go missing between pages.
const orderBy: Record<MemberSort, Prisma.ClanMemberOrderByWithRelationInput[]> = {
    rank: [{ priority: "desc" }, { createdAt: "asc" }, { id: "asc" }],
    newest: [{ createdAt: "desc" }, { id: "desc" }],
    oldest: [{ createdAt: "asc" }, { id: "asc" }],
    name: [{ user: { username: "asc" } }, { id: "asc" }],
}

/** Returns one page of the members of a clan. */
export async function getClanMembers(clanId: unknown, input: unknown): Promise<ActionResult<ClanMemberList>> {
    const t = await getTranslations("ClanMembers")

    const parsedId = objectIdSchema.safeParse(clanId)
    const parsed = clanMemberQuerySchema.safeParse(input)

    if (!parsedId.success || !parsed.success) return { success: false, error: t("loadError") }

    const { term, role, server, sort, page } = parsed.data

    const activeServer = { beganAt: getActiveServerRange() }
    const user: Prisma.UserWhereInput = {}
    const where: Prisma.ClanMemberWhereInput = { clanId: parsedId.data, user }

    if (role) where.role = role
    if (server) user.servers = { some: { serverId: server, isActive: true, server: activeServer } }

    // Only public names are searched, never the email or the real name.
    if (term) {
        user.OR = [
            { username: { contains: term, mode: "insensitive" } },
            { steamUsername: { contains: term, mode: "insensitive" } },
        ]
    }

    const include = {
        user: {
            omit: { password: true },
            include: { servers: { where: { isActive: true, server: activeServer }, include: { server: true } } },
        },
    } satisfies Prisma.ClanMemberInclude

    try {
        const [members, total] = await Promise.all([
            prisma.clanMember.findMany({
                where,
                orderBy: orderBy[sort],
                skip: (page - 1) * pageLimit,
                take: pageLimit,
                include,
            }),
            prisma.clanMember.count({ where }),
        ])

        return {
            success: true,
            data: {
                members: members.map((member) => ({ ...new ClanMemberDto(member) })),
                total,
                pageCount: Math.max(1, Math.ceil(total / pageLimit)),
            },
        }
    } catch (error) {
        console.error("getClanMembers failed", error)

        return { success: false, error: t("loadError") }
    }
}
