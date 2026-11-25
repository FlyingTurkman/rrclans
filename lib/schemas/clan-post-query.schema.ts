import { listQuerySchema } from "@/lib/schemas/list-query.schema"

// Search params of the wall of a clan.
export const clanPostQuerySchema = listQuerySchema.pick({ page: true })
