import { z } from "zod"
import { serializeToPlainText, type RTEDocument } from "@/components/rte/rte-engine"
import { postMaxLength } from "@/lib/src/constants"
import { editorFonts, editorFontSizes } from "@/lib/src/editorOptions"
import type { ValidationTranslator } from "@/types"

export const POST_TITLE_MAX_LENGTH = 120

// Hex, named or rgb()/hsl() colors. No quotes, semicolons or url(): the editor
// writes the value into a style attribute without escaping it.
const colorSchema = z.string().regex(/^(#[\da-f]{3,8}|[a-z]{1,30}|(rgb|hsl)a?\([\d\s.,%/]{1,60}\))$/i)

// Document of the rich text editor. Unknown keys are removed.
export const rteDocumentSchema = z.object({
    runs: z.array(z.object({
        id: z.string().max(100),
        text: z.string(),
        fontFamily: z.enum(editorFonts),
        fontSize: z.enum(editorFontSizes),
        color: colorSchema,
        markerColor: colorSchema,
        format: z.array(z.enum(["bold", "italic", "underline", "strikethrough", "overline"])).max(5),
        align: z.enum(["left", "center", "right", "justify"]),
    })).min(1).max(5000),
})

// Post on the wall of a clan.
export function createClanPostSchema(t: ValidationTranslator) {
    return z.object({
        title: z
            .string()
            .trim()
            .min(1, t("required"))
            .max(POST_TITLE_MAX_LENGTH, t("maxLength", { max: POST_TITLE_MAX_LENGTH })),
        // One message for the whole editor instead of one per run.
        rawContent: z
            .custom<RTEDocument>()
            .superRefine((value, context) => {
                const parsed = rteDocumentSchema.safeParse(value)

                if (!parsed.success) {
                    context.addIssue({ code: "custom", message: t("invalidContent") })
                    return
                }

                const text = serializeToPlainText(parsed.data)

                if (!text.trim()) {
                    context.addIssue({ code: "custom", message: t("required") })
                } else if (text.length > postMaxLength) {
                    context.addIssue({ code: "custom", message: t("maxLength", { max: postMaxLength }) })
                }
            })
            .transform((value): RTEDocument => rteDocumentSchema.parse(value)),
    })
}

export type ClanPostFormValues = z.infer<ReturnType<typeof createClanPostSchema>>
