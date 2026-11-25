import { z } from "zod"
import type { ValidationTranslator } from "@/types"

// Register form schema. Fields match CreateUserInput in types.d.ts
// (`fullname` is derived from name + surname on the server).
export function createRegisterSchema(t: ValidationTranslator) {
    return z.object({
        username: z
            .string()
            .trim()
            .min(1, t("required"))
            .min(3, t("minLength", { min: 3 }))
            .max(20, t("maxLength", { max: 20 })),
        name: z
            .string()
            .trim()
            .min(1, t("required"))
            .max(50, t("maxLength", { max: 50 })),
        surname: z
            .string()
            .trim()
            .min(1, t("required"))
            .max(50, t("maxLength", { max: 50 })),
        email: z
            .string()
            .trim()
            .toLowerCase()
            .min(1, t("required"))
            .pipe(z.email(t("invalidEmail"))),
        password: z
            .string()
            .min(1, t("required"))
            .min(8, t("minLength", { min: 8 }))
            .max(128, t("maxLength", { max: 128 })),
    })
}

export type RegisterFormValues = z.infer<ReturnType<typeof createRegisterSchema>>
