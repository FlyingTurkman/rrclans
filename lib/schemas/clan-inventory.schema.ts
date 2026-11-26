import { z } from "zod"
import { inventoryMaxQuantity } from "@/lib/src/constants"
import type { ValidationTranslator } from "@/types"

// Item a member adds to the inventory of their clan. The quantity is typed into
// a text input, so it is a string here. Whether the item exists is checked on
// the server (getItem), the item list is not sent to the browser.
export function createInventoryItemSchema(t: ValidationTranslator) {
    return z.object({
        itemId: z.string().regex(/^[a-z0-9-]{1,100}$/, t("required")),
        quantity: z
            .string()
            .trim()
            .min(1, t("required"))
            .refine(
                (value) => /^[1-9]\d*$/.test(value) && Number(value) <= inventoryMaxQuantity,
                t("numberRange", { min: 1, max: inventoryMaxQuantity })
            ),
    })
}

export type InventoryItemFormValues = z.infer<ReturnType<typeof createInventoryItemSchema>>
