"use server"

import { getTranslations } from "next-intl/server"
import { getSession } from "@/lib/auth/session"
import { prisma } from "@/lib/prisma"
import { objectIdSchema } from "@/lib/schemas/auth.schema"
import type { ActionResult } from "@/types"

/** Leaves a clan. The leader cannot leave: there is no leadership transfer yet. */
export async function leaveClan(clanId: string): Promise<ActionResult> {
    const t = await getTranslations("ClanJoin")

    const parsed = objectIdSchema.safeParse(clanId)

    if (!parsed.success) return { success: false, error: t("notFound") }

    try {
        const session = await getSession()

        if (!session) return { success: false, error: t("unauthorized") }

        const { count } = await prisma.clanMember.deleteMany({
            where: { clanId: parsed.data, userId: session.userId, role: { not: "LEADER" } },
        })

        if (count === 0) return { success: false, error: t("cannotLeave") }

        return { success: true, data: undefined }
    } catch (error) {
        console.error("leaveClan failed", error)

        return { success: false, error: t("actionError") }
    }
}
