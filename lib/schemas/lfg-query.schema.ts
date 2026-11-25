import { z } from "zod"
import { objectIdSchema } from "@/lib/schemas/auth.schema"
import { listQuerySchema } from "@/lib/schemas/list-query.schema"
import { regions } from "@/lib/src/regions"

// Search params of /lfc and /lfp. Used by the pages to read the URL and by the
// actions to validate the query.
export const lfgQuerySchema = listQuerySchema.extend({
    region: z.enum(regions).optional().catch(undefined),
    // Id of an active server.
    server: objectIdSchema.optional().catch(undefined),
})

export type LfgQuery = z.infer<typeof lfgQuerySchema>
