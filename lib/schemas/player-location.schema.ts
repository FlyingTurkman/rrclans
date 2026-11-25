import { z } from "zod"
import { districts, settlementCount } from "@/lib/src/constants"
import type { ValidationTranslator } from "@/types"

// Location of a player on a server. District and settlement are both required.
// The settlement is typed into a text input, so it is a string here.
export function createPlayerLocationSchema(t: ValidationTranslator) {
    return z.object({
        district: z.enum(districts.map(({ name }) => name), t("required")),
        settlement: z
            .string()
            .trim()
            .min(1, t("required"))
            .refine(
                (value) => /^[1-9]\d*$/.test(value) && Number(value) <= settlementCount,
                t("numberRange", { min: 1, max: settlementCount })
            ),
    })
}

export type PlayerLocationFormValues = z.infer<ReturnType<typeof createPlayerLocationSchema>>
