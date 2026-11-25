'use client'

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useTranslations } from "next-intl"
import { updateClan } from "@/actions/clan-panel/update-clan"
import FormSelectField from "@/components/form/FormSelectField"
import FormTextField from "@/components/form/FormTextField"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { FieldError, FieldGroup } from "@/components/ui/field"
import { useClanContext } from "@/context/ClanContext"
import { createClanSchema, type ClanFormValues } from "@/lib/schemas/clan.schema"
import { clanJoinModes } from "@/lib/src/clanJoinModes"
import { regions } from "@/lib/src/regions"









// Name, tag, region and join mode of the clan.
export default function ClanInfoForm() {
    const t = useTranslations("ClanPanel")
    const tl = useTranslations("ListFilters")
    const tv = useTranslations("Validation")
    const { clan, reload } = useClanContext()

    const [isSaved, setIsSaved] = useState(false)

    const form = useForm<ClanFormValues>({
        resolver: zodResolver(createClanSchema(tv)),
        defaultValues: { clanName: clan.clanName, clanTag: clan.clanTag, region: clan.region, joinMode: clan.joinMode },
    })

    async function onSubmit(values: ClanFormValues) {
        setIsSaved(false)

        try {
            const result = await updateClan(clan.id, values)

            if (result.success) {
                form.reset(values)
                setIsSaved(true)
                reload()
                return
            }

            for (const name of ["clanName", "clanTag", "region", "joinMode"] as const) {
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
                <CardTitle>{t("info")}</CardTitle>
            </CardHeader>
            <CardContent>
                <form id="clan-info-form" autoComplete="off" onSubmit={form.handleSubmit(onSubmit)}>
                    <FieldGroup>
                        <FormTextField
                            control={form.control}
                            name="clanName"
                            id="clan-info-name"
                            label={t("clanName")}
                        />
                        <FormTextField
                            control={form.control}
                            name="clanTag"
                            id="clan-info-tag"
                            label={t("clanTag")}
                        />
                        <FormSelectField
                            control={form.control}
                            name="region"
                            id="clan-info-region"
                            label={tl("regionLabel")}
                            items={regions.map((value) => ({ value, label: tl(`regions.${value}`) }))}
                        />
                        <FormSelectField
                            control={form.control}
                            name="joinMode"
                            id="clan-info-join-mode"
                            label={t("joinMode")}
                            items={clanJoinModes.map((value) => ({ value, label: t(`joinModes.${value}`) }))}
                        />
                        {form.formState.errors.root && <FieldError errors={[form.formState.errors.root]}/>}
                        {isSaved && <p role="status" className="text-sm text-primary">{t("saved")}</p>}
                    </FieldGroup>
                </form>
            </CardContent>
            <CardFooter className="justify-end">
                <Button
                    type="submit"
                    form="clan-info-form"
                    disabled={form.formState.isSubmitting}
                >
                    {t("save")}
                </Button>
            </CardFooter>
        </Card>
    )
}
