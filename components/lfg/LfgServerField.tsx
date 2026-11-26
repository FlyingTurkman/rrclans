'use client'

import type { ReactNode } from "react"
import { Controller, type Control, type FieldPath, type FieldValues } from "react-hook-form"
import { useTranslations } from "next-intl"
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { ServerDto } from "@/dtos/serverDTO"









type LfgServerFieldProps<T extends FieldValues> = {
    control: Control<T>
    // Field with the ids of the chosen servers.
    name: FieldPath<T>
    id: string
    // Servers that can be chosen.
    servers: ServerDto[]
    // Shown when there is nothing to choose.
    empty: ReactNode
    // Above the servers, e.g. a search to add more.
    children?: ReactNode
}

// Servers a listing is for: every server can be switched on and off.
export default function LfgServerField<T extends FieldValues>({ control, name, id, servers, empty, children }: LfgServerFieldProps<T>) {
    const t = useTranslations("Lfg")

    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState }) => {

                return (
                    <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={id}>{t("servers")}</FieldLabel>
                        <FieldDescription>{t("serversDescription")}</FieldDescription>
                        {children}
                        {servers.length === 0 ? empty : (
                            <ToggleGroup
                                id={id}
                                multiple
                                variant="outline"
                                className="flex-wrap"
                                value={field.value}
                                onValueChange={field.onChange}
                                aria-invalid={fieldState.invalid}
                            >
                                {servers.map((server) => {

                                    return (
                                        <ToggleGroupItem
                                            key={server.id}
                                            value={server.id}
                                            className="data-pressed:border-primary data-pressed:text-primary"
                                        >
                                            {server.serverName}
                                        </ToggleGroupItem>
                                    )
                                })}
                            </ToggleGroup>
                        )}
                        {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
                    </Field>
                )
            }}
        />
    )
}
