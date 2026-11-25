'use client'

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useTranslations } from "next-intl"
import { changePassword } from "@/actions/profile/change-password"
import FormTextField from "@/components/form/FormTextField"
import ProfileFormCard from "@/components/profile/ProfileFormCard"
import { createChangePasswordSchema, type ChangePasswordFormValues } from "@/lib/schemas/change-password.schema"









export default function ChangePasswordForm() {
    const t = useTranslations("ProfilePage")
    const tv = useTranslations("Validation")
    const te = useTranslations("AuthErrors")

    const [saved, setSaved] = useState<string | null>(null)

    const form = useForm<ChangePasswordFormValues>({
        resolver: zodResolver(createChangePasswordSchema(tv)),
        defaultValues: { currentPassword: "", newPassword: "" },
    })

    async function onSubmit(values: ChangePasswordFormValues) {
        setSaved(null)

        try {
            const result = await changePassword(values)

            if (result.success) {
                form.reset()
                setSaved(t("passwordSaved"))
                return
            }

            for (const name of ["currentPassword", "newPassword"] as const) {
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
        <ProfileFormCard
        formId="change-password-form"
        title={t("password")}
        description={t("passwordDescription")}
        saved={saved}
        error={form.formState.errors.root}
        isSubmitting={form.formState.isSubmitting}
        onSubmit={form.handleSubmit(onSubmit)}
        >
            <FormTextField
            control={form.control}
            name="currentPassword"
            id="change-password-current"
            label={t("currentPassword")}
            type="password"
            />
            <FormTextField
            control={form.control}
            name="newPassword"
            id="change-password-new"
            label={t("newPassword")}
            type="password"
            />
        </ProfileFormCard>
    )
}
