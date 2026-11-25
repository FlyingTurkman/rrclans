'use client'

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useTranslations } from "next-intl"
import { updateProfile } from "@/actions/profile/update-profile"
import FormTextField from "@/components/form/FormTextField"
import ProfileFormCard from "@/components/profile/ProfileFormCard"
import { useSiteContext } from "@/context/SiteContext"
import type { UserDto } from "@/dtos/userDTO"
import { createProfileSchema, type ProfileFormValues } from "@/lib/schemas/profile.schema"









const fieldNames = ["username", "name", "surname"] as const

type ProfileFormProps = {
    user: UserDto
}

// Username and name of the logged-in user.
export default function ProfileForm({ user }: ProfileFormProps) {
    const t = useTranslations("ProfilePage")
    const tv = useTranslations("Validation")
    const te = useTranslations("AuthErrors")
    const { setUser } = useSiteContext()

    const [saved, setSaved] = useState<string | null>(null)

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(createProfileSchema(tv)),
        defaultValues: { username: user.username, name: user.name, surname: user.surname },
    })

    async function onSubmit(values: ProfileFormValues) {
        setSaved(null)

        try {
            const result = await updateProfile(values)

            if (result.success) {
                const { username, name, surname } = result.data

                setUser(result.data)
                form.reset({ username, name, surname })
                setSaved(t("saved"))
                return
            }

            fieldNames.forEach((name) => {
                const message = result.fieldErrors?.[name]

                if (message) form.setError(name, { message })
            })

            if (result.error) form.setError("root", { message: result.error })
        } catch {
            // The request itself failed (e.g. no connection).
            form.setError("root", { message: te("unknown") })
        }
    }

    return (
        <ProfileFormCard
        formId="profile-form"
        title={t("info")}
        description={t("infoDescription")}
        saved={saved}
        error={form.formState.errors.root}
        isSubmitting={form.formState.isSubmitting}
        onSubmit={form.handleSubmit(onSubmit)}
        >
            {fieldNames.map((name) => {

                return (
                    <FormTextField
                    key={name}
                    control={form.control}
                    name={name}
                    id={`profile-${name}`}
                    label={t(name)}
                    />
                )
            })}
        </ProfileFormCard>
    )
}
