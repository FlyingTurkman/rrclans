'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useTranslations } from "next-intl"
import { saveLfpListing } from "@/actions/lfp/save-lfp-listing"
import FormTextareaField from "@/components/form/FormTextareaField"
import { Button } from "@/components/ui/button"
import { FieldError, FieldGroup } from "@/components/ui/field"
import { createLfpSchema, type LfpFormValues } from "@/lib/schemas/lfp.schema"
import { listingMaxLength } from "@/lib/src/constants"









type LfpFormProps = {
    clanId: string
    // Current listing of the clan, null for a new one.
    message: string | null
    onSaved: () => void
    onCancel: () => void
}

export default function LfpForm({ clanId, message, onSaved, onCancel }: LfpFormProps) {
    const t = useTranslations("Lfg")
    const tv = useTranslations("Validation")
    const te = useTranslations("AuthErrors")

    const form = useForm<LfpFormValues>({
        resolver: zodResolver(createLfpSchema(tv)),
        defaultValues: { message: message ?? "" },
    })

    async function onSubmit(values: LfpFormValues) {
        try {
            const result = await saveLfpListing(clanId, values)

            if (result.success) {
                onSaved()
                return
            }

            if (result.fieldErrors?.message) form.setError("message", { message: result.fieldErrors.message })
            if (result.error) form.setError("root", { message: result.error })
        } catch {
            // The request itself failed (e.g. no connection).
            form.setError("root", { message: te("unknown") })
        }
    }

    return (
        <form autoComplete="off" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
                <FormTextareaField
                    control={form.control}
                    name="message"
                    id={`lfp-message-${clanId}`}
                    label={t("message")}
                    maxLength={listingMaxLength}
                />
                {form.formState.errors.root && <FieldError errors={[form.formState.errors.root]}/>}
                <div className="flex justify-end gap-2">
                    <Button
                        type="button"
                        variant="ghost"
                        disabled={form.formState.isSubmitting}
                        onClick={onCancel}
                    >
                        {t("cancel")}
                    </Button>
                    <Button
                        type="submit"
                        disabled={form.formState.isSubmitting}
                    >
                        {t("save")}
                    </Button>
                </div>
            </FieldGroup>
        </form>
    )
}
