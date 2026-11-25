'use client'

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useTranslations } from "next-intl"
import { changeEmail } from "@/actions/profile/change-email"
import FormTextField from "@/components/form/FormTextField"
import ProfileFormCard from "@/components/profile/ProfileFormCard"
import { useSiteContext } from "@/context/SiteContext"
import type { UserDto } from "@/dtos/userDTO"
import { createChangeEmailSchema, type ChangeEmailFormValues } from "@/lib/schemas/change-email.schema"









type ChangeEmailFormProps = {
    user: UserDto
}

export default function ChangeEmailForm({ user }: ChangeEmailFormProps) {
    const t = useTranslations("ProfilePage")
    const tv = useTranslations("Validation")
    const te = useTranslations("AuthErrors")
    const { setUser } = useSiteContext()

    const [saved, setSaved] = useState<string | null>(null)

    const form = useForm<ChangeEmailFormValues>({
        resolver: zodResolver(createChangeEmailSchema(tv)),
        defaultValues: { email: "", currentPassword: "" },
    })

    async function onSubmit(values: ChangeEmailFormValues) {
        setSaved(null)

        try {
            const result = await changeEmail(values)

            if (result.success) {
                setUser(result.data)
                form.reset()
                setSaved(t("saved"))
                return
            }

            for (const name of ["email", "currentPassword"] as const) {
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
        formId="change-email-form"
        title={t("email")}
        description={t("emailDescription", { email: user.email })}
        saved={saved}
        error={form.formState.errors.root}
        isSubmitting={form.formState.isSubmitting}
        onSubmit={form.handleSubmit(onSubmit)}
        >
            <FormTextField
            control={form.control}
            name="email"
            id="change-email-email"
            label={t("newEmail")}
            type="email"
            />
            <FormTextField
            control={form.control}
            name="currentPassword"
            id="change-email-password"
            label={t("currentPassword")}
            type="password"
            />
        </ProfileFormCard>
    )
}
