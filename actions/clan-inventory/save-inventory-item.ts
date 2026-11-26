"use server"

import { getTranslations } from "next-intl/server"
import { getSession } from "@/lib/auth/session"
import { getItem } from "@/lib/src/items"
import { getActivePlayerServer } from "@/lib/players/servers"
import { prisma } from "@/lib/prisma"
import { objectIdSchema } from "@/lib/schemas/auth.schema"
import { createInventoryItemSchema, type InventoryItemFormValues } from "@/lib/schemas/clan-inventory.schema"
import { toFieldErrors } from "@/lib/validation"
import type { ActionResult } from "@/types"

/**
 * Lists an item of the logged-in member on their active server. An item that is
 * already listed there gets the new quantity.
 */
export async function saveInventoryItem(clanId: string, input: InventoryItemFormValues): Promise<ActionResult> {
    const t = await getTranslations("ClanInventory")
    const tv = await getTranslations("Validation")

    const parsedId = objectIdSchema.safeParse(clanId)
    const parsed = createInventoryItemSchema(tv).safeParse(input)

    if (!parsedId.success) return { success: false, error: t("actionError") }
    if (!parsed.success) return { success: false, fieldErrors: toFieldErrors(parsed.error) }

    const { itemId } = parsed.data

    if (!getItem(itemId)) return { success: false, fieldErrors: { itemId: t("itemNotFound") } }
    const quantity = Number(parsed.data.quantity)

    try {
        const session = await getSession()

        if (!session) return { success: false, error: t("membersOnly") }

        const [member, server] = await Promise.all([
            prisma.clanMember.findUnique({
                where: { userId_clanId: { userId: session.userId, clanId: parsedId.data } },
                select: { id: true },
            }),
            getActivePlayerServer(session.userId),
        ])

        if (!member) return { success: false, error: t("membersOnly") }
        if (!server) return { success: false, error: t("noServer") }

        await prisma.clanInventoryItem.upsert({
            where: { memberId_serverId_itemId: { memberId: member.id, serverId: server.id, itemId } },
            create: { clanId: parsedId.data, memberId: member.id, serverId: server.id, itemId, quantity },
            update: { quantity },
        })

        return { success: true, data: undefined }
    } catch (error) {
        console.error("saveInventoryItem failed", error)

        return { success: false, error: t("actionError") }
    }
}
