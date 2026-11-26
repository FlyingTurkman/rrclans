'use client'

import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useTranslations } from "next-intl"
import { saveLfpListing } from "@/actions/lfp/save-lfp-listing"
import FormSelectField from "@/components/form/FormSelectField"
import FormTextareaField from "@/components/form/FormTextareaField"
import LfgServerField from "@/components/lfg/LfgServerField"
import { Button } from "@/components/ui/button"
import { FieldError, FieldGroup } from "@/components/ui/field"
import type { ServerDto } from "@/dtos/serverDTO"
import { createLfpSchema, type LfpFormValues } from "@/lib/schemas/lfp.schema"
import { lfpRoles } from "@/lib/src/clanRoles"
import { listingMaxLength } from "@/lib/src/constants"









type LfpFormProps = {
    clanId: string
    // Active servers of the clan, the listing is for some of them.
    servers: ServerDto[]
    // Current listing of the clan, null for a new one.
    listing: LfpFormValues | null
    onSaved: () => void
    onCancel: () => void
}

export default function LfpForm({ clanId, servers, listing, onSaved, onCancel }: LfpFormProps) {
    const t = useTranslations("Lfg")
    const tr = useTranslations("ClanRoles")
    const tv = useTranslations("Validation")
    const te = useTranslations("AuthErrors")

    const form = useForm<LfpFormValues>({
        resolver: zodResolver(createLfpSchema(tv)),
        // A new listing is for every active server of the clan.
        defaultValues: listing ?? { message: "", role: "RECRUIT", serverIds: servers.map(({ id }) => id) },
    })

    async function onSubmit(values: LfpFormValues) {
        try {
            const result = await saveLfpListing(clanId, values)

            if (result.success) {
                onSaved()
                return
            }

            for (const name of ["message", "role", "serverIds"] as const) {
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
                    name="role"
                    id={`lfp-role-${clanId}`}
                    label={t("role")}
                    items={lfpRoles.map((value) => ({ value, label: tr(value) }))}
                />
                <LfgServerField
                    control={form.control}
                    name="serverIds"
                    id={`lfp-servers-${clanId}`}
                    servers={servers}
                    empty={(
                        <p className="text-sm text-muted-foreground">
                            {t.rich("noClanServers", {
                                link: (chunks) => <Link href={`/c/${clanId}/panel/servers`} className="text-primary hover:underline">{chunks}</Link>,
                            })}
                        </p>
                    )}
                />
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
