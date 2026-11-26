"use server"

import { getTranslations } from "next-intl/server"
import { getSession } from "@/lib/auth/session"
import { prisma } from "@/lib/prisma"
import { objectIdSchema } from "@/lib/schemas/auth.schema"
import type { ActionResult } from "@/types"

/** Removes an item from the inventory of a clan, only the member who listed it. */
export async function removeInventoryItem(itemRecordId: string): Promise<ActionResult> {
    const t = await getTranslations("ClanInventory")

    const parsed = objectIdSchema.safeParse(itemRecordId)

    if (!parsed.success) return { success: false, error: t("itemNotFound") }

    try {
        const session = await getSession()

        if (!session) return { success: false, error: t("membersOnly") }

        const { count } = await prisma.clanInventoryItem.deleteMany({
            where: { id: parsed.data, member: { userId: session.userId } },
        })

        if (count === 0) return { success: false, error: t("itemNotFound") }

        return { success: true, data: undefined }
    } catch (error) {
        console.error("removeInventoryItem failed", error)

        return { success: false, error: t("actionError") }
    }
}
