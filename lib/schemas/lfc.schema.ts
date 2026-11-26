import { z } from "zod"
import { createListingSchema } from "@/lib/schemas/lfp.schema"
import { regions } from "@/lib/src/regions"
import type { ValidationTranslator } from "@/types"

// Listing of a player who searches for a clan.
export function createLfcSchema(t: ValidationTranslator) {
    return createListingSchema(t).extend({
        region: z.enum(regions, t("required")),
    })
}

export type LfcFormValues = z.input<ReturnType<typeof createLfcSchema>>
