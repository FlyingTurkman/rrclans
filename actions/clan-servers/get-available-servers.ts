"use server"

import { getTranslations } from "next-intl/server"
import { ServerDto } from "@/dtos/serverDTO"
import { getClanAccess } from "@/lib/clans/access"
import { prisma } from "@/lib/prisma"
import { objectIdSchema } from "@/lib/schemas/auth.schema"
import { getActiveServerRange } from "@/lib/src/serverLifetime"
import type { ActionResult } from "@/types"

/** Active servers that are not in the clan yet (leader and officers). */
export async function getAvailableServers(clanId: string): Promise<ActionResult<ServerDto[]>> {
    const t = await getTranslations("ClanServers")

    const parsedId = objectIdSchema.safeParse(clanId)

    if (!parsedId.success) return { success: false, error: t("actionError") }

    try {
        const access = await getClanAccess(parsedId.data)

        if (!access?.isManager) return { success: false, error: t("forbidden") }

        const servers = await prisma.server.findMany({
            where: { beganAt: getActiveServerRange(), clans: { none: { clanId: parsedId.data } } },
            orderBy: [{ beganAt: "desc" }, { id: "desc" }],
        })

        return { success: true, data: servers.map((server) => ({ ...new ServerDto(server) })) }
    } catch (error) {
        console.error("getAvailableServers failed", error)

        return { success: false, error: t("actionError") }
    }
}
