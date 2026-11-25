import { z } from "zod"
import { clanJoinModes } from "@/lib/src/clanJoinModes"
import { regions } from "@/lib/src/regions"
import type { ValidationTranslator } from "@/types"

// Clan information form. Tags are saved in upper case, so "lasx" cannot be
// taken next to "LASX".
export function createClanSchema(t: ValidationTranslator) {
    return z.object({
        clanName: z
            .string()
            .trim()
            .min(1, t("required"))
            .min(3, t("minLength", { min: 3 }))
            .max(30, t("maxLength", { max: 30 })),
        clanTag: z
            .string()
            .trim()
            .toUpperCase()
            .min(1, t("required"))
            .min(2, t("minLength", { min: 2 }))
            .max(5, t("maxLength", { max: 5 }))
            .regex(/^[A-Z0-9]*$/, t("invalidTag")),
        region: z.enum(regions, t("required")),
        joinMode: z.enum(clanJoinModes, t("required")),
    })
}

export type ClanFormValues = z.infer<ReturnType<typeof createClanSchema>>
