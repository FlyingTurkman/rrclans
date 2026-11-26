'use client'

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { useTranslations } from "next-intl"
import { saveInventoryItem } from "@/actions/clan-inventory/save-inventory-item"
import FormTextField from "@/components/form/FormTextField"
import ItemSearch from "@/components/items/ItemSearch"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { useClanContext } from "@/context/ClanContext"
import type { ItemDto } from "@/dtos/itemDTO"
import type { ServerDto } from "@/dtos/serverDTO"
import { createInventoryItemSchema, type InventoryItemFormValues } from "@/lib/schemas/clan-inventory.schema"









const emptyValues: InventoryItemFormValues = { itemId: "", quantity: "1" }

type ClanInventoryFormProps = {
    // Active server of the logged-in member, the items are listed there.
    server: ServerDto
    onSaved: () => void
}

// Lists an item of the logged-in member in the inventory of the clan.
export default function ClanInventoryForm({ server, onSaved }: ClanInventoryFormProps) {
    const t = useTranslations("ClanInventory")
    const tv = useTranslations("Validation")
    const { clan } = useClanContext()

    // Chosen item, to show its name on the trigger.
    const [item, setItem] = useState<ItemDto | null>(null)

    const form = useForm<InventoryItemFormValues>({
        resolver: zodResolver(createInventoryItemSchema(tv)),
        defaultValues: emptyValues,
    })

    async function onSubmit(values: InventoryItemFormValues) {
        try {
            const result = await saveInventoryItem(clan.id, values)

            if (result.success) {
                form.reset(emptyValues)
                setItem(null)
                onSaved()
                return
            }

            for (const name of ["itemId", "quantity"] as const) {
                const message = result.fieldErrors?.[name]

                if (message) form.setError(name, { message })
            }

            if (result.error) form.setError("root", { message: result.error })
        } catch {
            // The request itself failed (e.g. no connection).
            form.setError("root", { message: t("actionError") })
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t("addTitle")}</CardTitle>
                <CardDescription>{t("addDescription", { server: server.serverName })}</CardDescription>
            </CardHeader>
            <CardContent>
                <form autoComplete="off" onSubmit={form.handleSubmit(onSubmit)}>
                    <FieldGroup>
                        <div className="grid gap-4 sm:grid-cols-[1fr_10rem_auto] sm:items-start">
                            <Controller
                                name="itemId"
                                control={form.control}
                                render={({ field, fieldState }) => {

                                    return (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor="inventory-item">{t("item")}</FieldLabel>
                                            <ItemSearch
                                                id="inventory-item"
                                                triggerText={item?.name ?? t("chooseItem")}
                                                selectedId={field.value}
                                                invalid={fieldState.invalid}
                                                onSelect={(newItem) => {
                                                    setItem(newItem)
                                                    field.onChange(newItem.id)
                                                }}
                                            />
                                            {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
                                        </Field>
                                    )
                                }}
                            />
                            <FormTextField
                                control={form.control}
                                name="quantity"
                                id="inventory-quantity"
                                label={t("quantity")}
                            />
                            <Button
                                type="submit"
                                className="sm:mt-6"
                                disabled={form.formState.isSubmitting}
                            >
                                {t("add")}
                            </Button>
                        </div>
                        {form.formState.errors.root && <FieldError errors={[form.formState.errors.root]}/>}
                    </FieldGroup>
                </form>
            </CardContent>
        </Card>
    )
}
