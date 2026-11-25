'use client'

import { Controller, type Control, type FieldPath, type FieldValues } from "react-hook-form"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"









type FormTextareaFieldProps<T extends FieldValues> = {
    control: Control<T>
    name: FieldPath<T>
    id: string
    label: string
    maxLength?: number
}

// Multi-line text input of a react-hook-form form.
export default function FormTextareaField<T extends FieldValues>({ control, name, id, label, maxLength }: FormTextareaFieldProps<T>) {

    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState }) => {

                return (
                    <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={id}>{label}</FieldLabel>
                        <Textarea
                            {...field}
                            id={id}
                            maxLength={maxLength}
                            autoComplete="off"
                            aria-invalid={fieldState.invalid}
                        />
                        {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
                    </Field>
                )
            }}
        />
    )
}
