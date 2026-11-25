'use client'

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useTranslations } from "next-intl"
import { setProfileLocation } from "@/actions/profile/set-profile-location"
import FormSelectField from "@/components/form/FormSelectField"
import FormTextField from "@/components/form/FormTextField"
import { Button } from "@/components/ui/button"
import { FieldError, FieldGroup } from "@/components/ui/field"
import type { PlayerLocationDto } from "@/dtos/playerLocationDTO"
import { createPlayerLocationSchema, type PlayerLocationFormValues } from "@/lib/schemas/player-location.schema"
import { districts, settlementCount } from "@/lib/src/constants"









type ServerLocationFormProps = {
    serverId: string
    location: PlayerLocationDto | null
}

// Location of the logged-in user on their active server. Every server has its
// own, so render it with the server id as key.
export default function ServerLocationForm({ serverId, location }: ServerLocationFormProps) {
    const t = useTranslations("ProfilePage")
    const tv = useTranslations("Validation")
    const te = useTranslations("AuthErrors")

    const [saved, setSaved] = useState(false)

    const form = useForm<PlayerLocationFormValues>({
        resolver: zodResolver(createPlayerLocationSchema(tv)),
        defaultValues: {
            district: location?.district ?? "",
            settlement: location?.settlement?.toString() ?? "",
        },
    })

    const districtItems = districts.map(({ name, level }) => ({ value: name, label: t("districtOption", { name, level }) }))

    async function onSubmit(values: PlayerLocationFormValues) {
        setSaved(false)

        try {
            const result = await setProfileLocation(serverId, values)

            if (result.success) {
                form.reset(values)
                setSaved(true)
                return
            }

            for (const name of ["district", "settlement"] as const) {
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
                <div>
                    <h3 className="font-medium">{t("location")}</h3>
                    <p className="text-sm text-muted-foreground">{t("locationDescription")}</p>
                </div>
                <FormSelectField
                    control={form.control}
                    name="district"
                    id="location-district"
                    label={t("district")}
                    placeholder={t("chooseDistrict")}
                    items={districtItems}
                />
                <FormTextField
                    control={form.control}
                    name="settlement"
                    id="location-settlement"
                    label={t("settlement", { max: settlementCount })}
                />
                {form.formState.errors.root && <FieldError errors={[form.formState.errors.root]}/>}
                {saved && <p role="status" className="text-sm text-primary">{t("saved")}</p>}
                <Button
                    type="submit"
                    className="self-end"
                    disabled={form.formState.isSubmitting}
                >
                    {t("saveLocation")}
                </Button>
            </FieldGroup>
        </form>
    )
}
