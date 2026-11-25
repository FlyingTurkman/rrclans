'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { useTranslations } from "next-intl"
import { saveLfcListing } from "@/actions/lfc/save-lfc-listing"
import FormTextareaField from "@/components/form/FormTextareaField"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createLfcSchema, type LfcFormValues } from "@/lib/schemas/lfc.schema"
import { listingMaxLength } from "@/lib/src/constants"
import { regions } from "@/lib/src/regions"









type LfcFormProps = {
    // Current listing of the user, null for a new one.
    listing: LfcFormValues | null
    onSaved: () => void
    onCancel: () => void
}

export default function LfcForm({ listing, onSaved, onCancel }: LfcFormProps) {
    const t = useTranslations("Lfg")
    const tl = useTranslations("ListFilters")
    const tv = useTranslations("Validation")
    const te = useTranslations("AuthErrors")

    const form = useForm<LfcFormValues>({
        resolver: zodResolver(createLfcSchema(tv)),
        defaultValues: listing ?? { message: "", region: regions[0] },
    })

    const regionItems = regions.map((value) => ({ value, label: tl(`regions.${value}`) }))

    async function onSubmit(values: LfcFormValues) {
        try {
            const result = await saveLfcListing(values)

            if (result.success) {
                onSaved()
                return
            }

            for (const name of ["message", "region"] as const) {
                const message = result.fieldErrors?.[name]

                if (message) form.setError(name, { message })
            }

            if (result.error) form.setError("root", { message: result.error })
        } catch {
            // The request itself failed (e.g. no connection).
            form.setError("root", { message: te("unknown") })
        }
    }

    return (
        <form autoComplete="off" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
                <Controller
                    name="region"
                    control={form.control}
                    render={({ field, fieldState }) => {

                        return (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="lfc-region">{tl("regionLabel")}</FieldLabel>
                                <Select
                                    items={regionItems}
                                    value={field.value}
                                    onValueChange={field.onChange}
                                >
                                    <SelectTrigger
                                        id="lfc-region"
                                        ref={field.ref}
                                        onBlur={field.onBlur}
                                        aria-invalid={fieldState.invalid}
                                    >
                                        <SelectValue/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {regionItems.map((item) => {

                                            return (
                                                <SelectItem
                                                    key={item.value}
                                                    value={item.value}
                                                >
                                                    {item.label}
                                                </SelectItem>
                                            )
                                        })}
                                    </SelectContent>
                                </Select>
                                {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
                            </Field>
                        )
                    }}
                />
                <FormTextareaField
                    control={form.control}
                    name="message"
                    id="lfc-message"
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
