import { z } from "zod"
import { listQuerySchema } from "@/lib/schemas/list-query.schema"
import { regions } from "@/lib/src/regions"

// Search params of /clans. Used by the page to read the URL and by the
// getClans action to validate the query.
export const clanQuerySchema = listQuerySchema.extend({
    region: z.enum(regions).optional().catch(undefined),
})

export type ClanQuery = z.infer<typeof clanQuerySchema>
