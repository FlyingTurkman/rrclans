'use client'

import { Controller, type Control, type FieldPath, type FieldValues } from "react-hook-form"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"









type FormSelectFieldProps<T extends FieldValues> = {
    control: Control<T>
    name: FieldPath<T>
    id: string
    label: string
    items: { value: string, label: string }[]
}

// Select of a react-hook-form form.
export default function FormSelectField<T extends FieldValues>({ control, name, id, label, items }: FormSelectFieldProps<T>) {

    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState }) => {

                return (
                    <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={id}>{label}</FieldLabel>
                        <Select
                            items={items}
                            value={field.value}
                            onValueChange={field.onChange}
                        >
                            <SelectTrigger
                                id={id}
                                ref={field.ref}
                                onBlur={field.onBlur}
                                aria-invalid={fieldState.invalid}
                            >
                                <SelectValue/>
                            </SelectTrigger>
                            <SelectContent>
                                {items.map((item) => {

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
    )
}
