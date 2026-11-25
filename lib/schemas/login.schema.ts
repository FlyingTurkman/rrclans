import { z } from "zod"
import type { ValidationTranslator } from "@/types"

// Login form schema. Users log in with email + password.
export function createLoginSchema(t: ValidationTranslator) {
    return z.object({
        email: z
            .string()
            .trim()
            .toLowerCase()
            .min(1, t("required"))
            .pipe(z.email(t("invalidEmail"))),
        password: z
            .string()
            .min(1, t("required")),
    })
}

export type LoginFormValues = z.infer<ReturnType<typeof createLoginSchema>>
