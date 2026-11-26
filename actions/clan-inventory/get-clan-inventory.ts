"use server"

import { getTranslations } from "next-intl/server"
import type { Prisma } from "@prisma/client"
import { ClanInventoryItemDto } from "@/dtos/clanInventoryDTO"
import { ServerDto } from "@/dtos/serverDTO"
import { getClanAccess } from "@/lib/clans/access"
import { getActivePlayerServer } from "@/lib/players/servers"
import { prisma } from "@/lib/prisma"
import { objectIdSchema } from "@/lib/schemas/auth.schema"
import { clanInventoryQuerySchema } from "@/lib/schemas/clan-inventory-query.schema"
import { pageLimit } from "@/lib/src/constants"
import { getItem, items as gameItems } from "@/lib/src/items"
import { getActiveServerRange } from "@/lib/src/serverLifetime"
import type { ActionResult, ClanInventoryList } from "@/types"

/**
 * Returns one page of the inventory of a clan, last changed first. Only for
 * members, and only items on active servers.
 */
export async function getClanInventory(clanId: unknown, input: unknown): Promise<ActionResult<ClanInventoryList>> {
    const t = await getTranslations("ClanInventory")

    const parsedId = objectIdSchema.safeParse(clanId)
    const parsed = clanInventoryQuerySchema.safeParse(input)

    if (!parsedId.success || !parsed.success) return { success: false, error: t("loadError") }

    const { item, rarity, server, page } = parsed.data

    try {
        const access = await getClanAccess(parsedId.data)

        if (!access?.isMember) return { success: false, error: t("membersOnly") }

        const where: Prisma.ClanInventoryItemWhereInput = {
            clanId: parsedId.data,
            server: { beganAt: getActiveServerRange() },
        }

        // The rarity is not saved, it is turned into the ids of its items.
        const rarityIds: string[] | null = rarity ? gameItems.filter((gameItem) => gameItem.rarity === rarity).map(({ id }) => id) : null

        if (item) where.itemId = rarityIds && !rarityIds.includes(item) ? { in: [] } : item
        else if (rarityIds) where.itemId = { in: rarityIds }
        if (server) where.serverId = server

        const [records, total, viewerServer] = await Promise.all([
            prisma.clanInventoryItem.findMany({
                where,
                orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
                skip: (page - 1) * pageLimit,
                take: pageLimit,
                include: { member: { include: { user: { omit: { password: true } } } }, server: true },
            }),
            prisma.clanInventoryItem.count({ where }),
            getActivePlayerServer(access.userId),
        ])

        return {
            success: true,
            data: {
                items: records.map((record) => ({
                    ...new ClanInventoryItemDto(record, getItem(record.itemId), { canRemove: record.member.userId === access.userId }),
                })),
                total,
                pageCount: Math.max(1, Math.ceil(total / pageLimit)),
                viewerServer: viewerServer ? { ...new ServerDto(viewerServer) } : null,
            },
        }
    } catch (error) {
        console.error("getClanInventory failed", error)

        return { success: false, error: t("loadError") }
    }
}
