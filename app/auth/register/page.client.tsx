'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { register } from "@/actions/auth/register"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useSiteContext } from "@/context/SiteContext"
import { createRegisterSchema, type RegisterFormValues } from "@/lib/schemas/register.schema"

// Form fields rendered in order. `name` is both the form field and the
// translation key in the "RegisterPage" namespace.
const registerFields = [
    { name: "username", type: "text" },
    { name: "name", type: "text" },
    { name: "surname", type: "text" },
    { name: "email", type: "email" },
    { name: "password", type: "password" },
] as const

export default function RegisterPageClient() {
    const t = useTranslations("RegisterPage")
    const tv = useTranslations("Validation")
    const te = useTranslations("AuthErrors")
    const router = useRouter()
    const { setUser } = useSiteContext()

    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(createRegisterSchema(tv)),
        defaultValues: { username: "", name: "", surname: "", email: "", password: "" },
    })

    async function onSubmit(values: RegisterFormValues) {
        try {
            const result = await register(values)

            if (result.success) {
                setUser(result.data)
                router.replace("/")
                return
            }

            registerFields.forEach(({ name }) => {
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
        <div className="flex justify-center px-4 py-10">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle>{t("title")}</CardTitle>
                    <CardDescription>{t("description")}</CardDescription>
                </CardHeader>
                <CardContent>
                    <form id="register-form" autoComplete="off" onSubmit={form.handleSubmit(onSubmit)}>
                        <FieldGroup>
                            {registerFields.map((registerField) => {

                                return (
                                    <Controller
                                        key={registerField.name}
                                        name={registerField.name}
                                        control={form.control}
                                        render={({ field, fieldState }) => {

                                            return (
                                                <Field data-invalid={fieldState.invalid}>
                                                    <FieldLabel htmlFor={`register-${registerField.name}`}>
                                                        {t(registerField.name)}
                                                    </FieldLabel>
                                                    <Input
                                                        {...field}
                                                        id={`register-${registerField.name}`}
                                                        type={registerField.type}
                                                        autoComplete="off"
                                                        aria-invalid={fieldState.invalid}
                                                    />
                                                    {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
                                                </Field>
                                            )
                                        }}
                                    />
                                )
                            })}
                            {form.formState.errors.root && <FieldError errors={[form.formState.errors.root]}/>}
                        </FieldGroup>
                    </form>
                </CardContent>
                <CardFooter className="flex-col gap-2">
                    <Button
                        type="submit"
                        form="register-form"
                        className="w-full"
                        disabled={form.formState.isSubmitting}
                    >
                        {t("submit")}
                    </Button>
                    <Link
                        href="/auth/login"
                        className={buttonVariants({ variant: "link" })}
                    >
                        {t("login")}
                    </Link>
                </CardFooter>
            </Card>
        </div>
    )
}
