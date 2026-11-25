import { z } from "zod"
import { clanAvatars } from "@/lib/src/clanAvatars"

// Chosen clan avatar, null for none. Picked from a fixed list, so there are no
// translated messages.
export const clanAvatarSchema = z.enum(clanAvatars).nullable()
