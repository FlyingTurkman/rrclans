import { z } from "zod"
import { listingMaxLength } from "@/lib/src/constants"
import type { ValidationTranslator } from "@/types"

// Listing of a clan that searches for players.
export function createLfpSchema(t: ValidationTranslator) {
    return z.object({
        message: z
            .string()
            .trim()
            .min(1, t("required"))
            .max(listingMaxLength, t("maxLength", { max: listingMaxLength })),
    })
}

export type LfpFormValues = z.infer<ReturnType<typeof createLfpSchema>>
