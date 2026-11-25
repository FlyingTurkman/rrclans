import { z } from "zod"
import { defaultListSort, listSorts } from "@/lib/src/listSorts"

export const TERM_MAX_LENGTH = 50

// Search params shared by every filtered list, extended by each list's own
// schema. An invalid value falls back to its default, so a broken or edited
// URL still shows the list.
export const listQuerySchema = z.object({
    // Only letters, numbers, spaces, "-" and "_" are kept: on MongoDB a text
    // search can become a regular expression.
    term: z
        .string()
        .max(TERM_MAX_LENGTH)
        .transform((value) => value.replace(/[^\p{L}\p{N} _-]/gu, "").trim())
        .catch(""),
    sort: z.enum(listSorts).catch(defaultListSort),
    page: z.coerce.number().int().min(1).max(1000).catch(1),
})
