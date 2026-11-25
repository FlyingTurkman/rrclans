import { z } from "zod"
import { objectIdSchema } from "@/lib/schemas/auth.schema"

// Rank change in the clan panel. LEADER cannot be given.
export const memberRoleSchema = z.object({
    memberId: objectIdSchema,
    role: z.enum(["OFFICER", "FIGHTER", "RECRUIT"]),
})
