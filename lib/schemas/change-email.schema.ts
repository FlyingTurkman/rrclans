import { z } from "zod"
import { createRegisterSchema } from "@/lib/schemas/register.schema"
import type { ValidationTranslator } from "@/types"

export function createChangeEmailSchema(t: ValidationTranslator) {
    return z.object({
        email: createRegisterSchema(t).shape.email,
        currentPassword: z.string().min(1, t("required")),
    })
}

export type ChangeEmailFormValues = z.infer<ReturnType<typeof createChangeEmailSchema>>
