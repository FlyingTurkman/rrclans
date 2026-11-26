'use client'

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useTranslations } from "next-intl"
import { saveLfcListing } from "@/actions/lfc/save-lfc-listing"
import { searchServers } from "@/actions/servers/search-servers"
import FormSelectField from "@/components/form/FormSelectField"
import FormTextareaField from "@/components/form/FormTextareaField"
import LfgServerField from "@/components/lfg/LfgServerField"
import ServerSearch from "@/components/servers/ServerSearch"
import { Button } from "@/components/ui/button"
import { FieldError, FieldGroup } from "@/components/ui/field"
import type { ServerDto } from "@/dtos/serverDTO"
import { createLfcSchema, type LfcFormValues } from "@/lib/schemas/lfc.schema"
import { lfgMaxServers, listingMaxLength } from "@/lib/src/constants"
import { regions } from "@/lib/src/regions"
import type { OwnLfcListing } from "@/types"









type LfcFormProps = {
    // Current listing of the user, null for a new one.
    listing: OwnLfcListing | null
    onSaved: () => void
    onCancel: () => void
}

export default function LfcForm({ listing, onSaved, onCancel }: LfcFormProps) {
    const t = useTranslations("Lfg")
    const tl = useTranslations("ListFilters")
    const tv = useTranslations("Validation")
    const te = useTranslations("AuthErrors")

    // Servers found with the search stay in the list, also when switched off.
    const [servers, setServers] = useState<ServerDto[]>(listing?.servers ?? [])

    const form = useForm<LfcFormValues>({
        resolver: zodResolver(createLfcSchema(tv)),
        defaultValues: {
            message: listing?.message ?? "",
            region: listing?.region ?? regions[0],
            serverIds: listing?.servers.map(({ id }) => id) ?? [],
        },
    })

    const regionItems = regions.map((value) => ({ value, label: tl(`regions.${value}`) }))

    function handleAddServer(server: ServerDto) {
        const ids = form.getValues("serverIds")

        if (!servers.some(({ id }) => id === server.id)) setServers((current) => [...current, server])
        if (!ids.includes(server.id)) form.setValue("serverIds", [...ids, server.id], { shouldValidate: form.formState.isSubmitted })
    }

    async function onSubmit(values: LfcFormValues) {
        try {
            const result = await saveLfcListing(values)

            if (result.success) {
                onSaved()
                return
            }

            for (const name of ["message", "region", "serverIds"] as const) {
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
                <FormSelectField
                    control={form.control}
                    name="region"
                    id="lfc-region"
                    label={tl("regionLabel")}
                    items={regionItems}
                />
                <LfgServerField
                    control={form.control}
                    name="serverIds"
                    id="lfc-servers"
                    servers={servers}
                    empty={null}
                >
                    <ServerSearch
                        triggerText={t("addServer")}
                        search={searchServers}
                        disabled={servers.length >= lfgMaxServers}
                        onSelect={handleAddServer}
                    />
                </LfgServerField>
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
