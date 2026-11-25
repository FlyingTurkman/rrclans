'use client'

import { Controller, type Control, type FieldPath, type FieldValues } from "react-hook-form"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"









type FormTextFieldProps<T extends FieldValues> = {
    control: Control<T>
    name: FieldPath<T>
    id: string
    label: string
    type?: "text" | "email" | "password"
}

// Text input of a react-hook-form form.
export default function FormTextField<T extends FieldValues>({ control, name, id, label, type = "text" }: FormTextFieldProps<T>) {

    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState }) => {

                return (
                    <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={id}>{label}</FieldLabel>
                        <Input
                            {...field}
                            id={id}
                            type={type}
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
