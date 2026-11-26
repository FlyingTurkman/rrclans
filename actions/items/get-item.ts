"use server"

import { getTranslations } from "next-intl/server"
import { ItemDto } from "@/dtos/itemDTO"
import { itemIdSchema } from "@/lib/schemas/item-search.schema"
import { getItem as findItem } from "@/lib/src/items"
import type { ActionResult } from "@/types"

/** One item by its id, e.g. to show the name of the item in a filter. */
export async function getItem(itemId: unknown): Promise<ActionResult<ItemDto>> {
    const t = await getTranslations("ItemSearch")

    const parsed = itemIdSchema.safeParse(itemId)
    const item = parsed.success ? findItem(parsed.data) : undefined

    if (!item) return { success: false, error: t("notFound") }

    return { success: true, data: { ...new ItemDto(item) } }
}
