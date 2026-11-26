import { z } from "zod"
import { objectIdSchema } from "@/lib/schemas/auth.schema"
import { itemIdSchema } from "@/lib/schemas/item-search.schema"
import { listQuerySchema } from "@/lib/schemas/list-query.schema"
import { itemRarities } from "@/lib/src/itemRarities"

// Search params of the inventory of a clan. Used by the page to read the URL and
// by the getClanInventory action to validate the query.
export const clanInventoryQuerySchema = listQuerySchema.pick({ page: true }).extend({
    item: itemIdSchema.optional().catch(undefined),
    rarity: z.enum(itemRarities).optional().catch(undefined),
    // Id of an active server.
    server: objectIdSchema.optional().catch(undefined),
})

export type ClanInventoryQuery = z.infer<typeof clanInventoryQuerySchema>
