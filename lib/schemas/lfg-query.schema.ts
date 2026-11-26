import { z } from "zod"
import { objectIdSchema } from "@/lib/schemas/auth.schema"
import { listQuerySchema } from "@/lib/schemas/list-query.schema"
import { lfpRoles } from "@/lib/src/clanRoles"
import { regions } from "@/lib/src/regions"

// Search params of /lfc. Used by the pages to read the URL and by the actions to
// validate the query.
export const lfgQuerySchema = listQuerySchema.extend({
    region: z.enum(regions).optional().catch(undefined),
    // Id of an active server.
    server: objectIdSchema.optional().catch(undefined),
})

export type LfgQuery = z.infer<typeof lfgQuerySchema>

// Search params of /lfp: also the rank the clan is looking for.
export const lfpQuerySchema = lfgQuerySchema.extend({
    role: z.enum(lfpRoles).optional().catch(undefined),
})

export type LfpQuery = z.infer<typeof lfpQuerySchema>
