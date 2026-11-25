import { z } from "zod"
import { listQuerySchema } from "@/lib/schemas/list-query.schema"

// Term of a server search. Cleaned the same way as list filters, an empty term
// returns the newest servers.
export const serverSearchSchema = z.object({
    term: listQuerySchema.shape.term,
})
