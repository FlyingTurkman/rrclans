"use server"

import { getTranslations } from "next-intl/server"
import { getSession } from "@/lib/auth/session"
import { prisma } from "@/lib/prisma"
import { objectIdSchema } from "@/lib/schemas/auth.schema"
import type { ActionResult } from "@/types"

/** Cancels the own join request and declines the own invite. */
export async function cancelJoin(clanId: string): Promise<ActionResult> {
    const t = await getTranslations("ClanJoin")

    const parsed = objectIdSchema.safeParse(clanId)

    if (!parsed.success) return { success: false, error: t("notFound") }

    try {
        const session = await getSession()

        if (!session) return { success: false, error: t("unauthorized") }

        const where = { clanId: parsed.data, userId: session.userId }

        await prisma.clanJoinRequest.deleteMany({ where })
        await prisma.clanInvite.deleteMany({ where })

        return { success: true, data: undefined }
    } catch (error) {
        console.error("cancelJoin failed", error)

        return { success: false, error: t("actionError") }
    }
}
