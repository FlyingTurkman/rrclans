import { z } from "zod"
import { objectIdSchema } from "@/lib/schemas/auth.schema"
import { listQuerySchema } from "@/lib/schemas/list-query.schema"
import { clanRoles } from "@/lib/src/clanRoles"
import { defaultMemberSort, memberSorts } from "@/lib/src/listSorts"

// Search params of the member lists of a clan. Used by the pages to read the
// URL and by the getClanMembers action to validate the query.
export const clanMemberQuerySchema = listQuerySchema.extend({
    sort: z.enum(memberSorts).catch(defaultMemberSort),
    role: z.enum(clanRoles).optional().catch(undefined),
    // Id of an active server.
    server: objectIdSchema.optional().catch(undefined),
})

export type ClanMemberQuery = z.infer<typeof clanMemberQuerySchema>
