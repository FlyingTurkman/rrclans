import { z } from "zod"
import { listQuerySchema } from "@/lib/schemas/list-query.schema"

// Term of the main menu search bar. Cleaned the same way as list filters.
export const searchSchema = z.object({
    term: listQuerySchema.shape.term,
})
