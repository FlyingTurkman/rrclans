import type { z } from "zod"
import { createRegisterSchema } from "@/lib/schemas/register.schema"
import type { ValidationTranslator } from "@/types"

// Profile form: same rules as the register form.
export function createProfileSchema(t: ValidationTranslator) {
    return createRegisterSchema(t).pick({ username: true, name: true, surname: true })
}

export type ProfileFormValues = z.infer<ReturnType<typeof createProfileSchema>>
