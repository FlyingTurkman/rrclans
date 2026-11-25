import { z } from "zod"

/** Converts a zod error into `{ field: firstMessage }` for ActionResult. */
export function toFieldErrors(error: z.ZodError): Record<string, string> {
    const fieldErrors: Record<string, string> = {}

    for (const issue of error.issues) {
        const field = issue.path.join(".")

        if (field && !fieldErrors[field]) fieldErrors[field] = issue.message
    }

    return fieldErrors
}
