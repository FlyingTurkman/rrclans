import type { z } from "zod"
import { listQuerySchema } from "@/lib/schemas/list-query.schema"

// Search params of /players. Used by the page to read the URL and by the
// getPlayers action to validate the query.
export const playerQuerySchema = listQuerySchema

export type PlayerQuery = z.infer<typeof playerQuerySchema>
