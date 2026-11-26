import { z } from "zod"
import { listQuerySchema } from "@/lib/schemas/list-query.schema"

// Term of an item search. Cleaned the same way as list filters, an empty term
// returns the first items.
export const itemSearchSchema = z.object({
    term: listQuerySchema.shape.term,
})

/** Id of an item (last part of its MetaForge URL). Whether it exists is checked with getItem. */
export const itemIdSchema = z.string().regex(/^[a-z0-9-]{1,100}$/)
