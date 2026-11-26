"use server"

import { getTranslations } from "next-intl/server"
import { ItemDto } from "@/dtos/itemDTO"
import { itemSearchSchema } from "@/lib/schemas/item-search.schema"
import { pageLimit } from "@/lib/src/constants"
import { items } from "@/lib/src/items"
import type { ActionResult } from "@/types"

/** Items whose name contains the term, the first ones without a term. */
export async function searchItems(input: unknown): Promise<ActionResult<ItemDto[]>> {
    const t = await getTranslations("ItemSearch")

    const parsed = itemSearchSchema.safeParse(input)

    if (!parsed.success) return { success: false, error: t("loadError") }

    const term = parsed.data.term.toLowerCase()
    const found = term ? items.filter(({ name }) => name.toLowerCase().includes(term)) : items

    return { success: true, data: found.slice(0, pageLimit).map((item) => ({ ...new ItemDto(item) })) }
}
