import { z } from "zod"
import { createRegisterSchema } from "@/lib/schemas/register.schema"
import type { ValidationTranslator } from "@/types"

export function createChangePasswordSchema(t: ValidationTranslator) {
    return z.object({
        currentPassword: z.string().min(1, t("required")),
        newPassword: createRegisterSchema(t).shape.password,
    })
}

export type ChangePasswordFormValues = z.infer<ReturnType<typeof createChangePasswordSchema>>
