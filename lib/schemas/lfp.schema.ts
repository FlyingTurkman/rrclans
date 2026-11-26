import { z } from "zod"
import { objectIdSchema } from "@/lib/schemas/auth.schema"
import { lfpRoles } from "@/lib/src/clanRoles"
import { lfgMaxServers, listingMaxLength } from "@/lib/src/constants"
import type { ValidationTranslator } from "@/types"

// Fields of every LFC and LFP listing: a message and the active servers it is for.
export function createListingSchema(t: ValidationTranslator) {
    return z.object({
        message: z
            .string()
            .trim()
            .min(1, t("required"))
            .max(listingMaxLength, t("maxLength", { max: listingMaxLength })),
        serverIds: z
            .array(objectIdSchema)
            .min(1, t("chooseServer"))
            .max(lfgMaxServers, t("maxServers", { max: lfgMaxServers }))
            .transform((ids) => [...new Set(ids)]),
    })
}

// Listing of a clan that searches for players, for one of its ranks.
export function createLfpSchema(t: ValidationTranslator) {
    return createListingSchema(t).extend({
        role: z.enum(lfpRoles, t("required")),
    })
}

export type LfpFormValues = z.input<ReturnType<typeof createLfpSchema>>
