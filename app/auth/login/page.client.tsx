'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { login } from "@/actions/auth/login"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useSiteContext } from "@/context/SiteContext"
import { nextPathSchema } from "@/lib/schemas/auth.schema"
import { createLoginSchema, type LoginFormValues } from "@/lib/schemas/login.schema"

// Form fields rendered in order. `name` is both the form field and the
// translation key in the "LoginPage" namespace.
const loginFields = [
    { name: "email", type: "email" },
    { name: "password", type: "password" },
] as const

export default function LoginPageClient() {
    const t = useTranslations("LoginPage")
    const tv = useTranslations("Validation")
    const te = useTranslations("AuthErrors")
    const router = useRouter()
    const searchParams = useSearchParams()
    const { setUser } = useSiteContext()

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(createLoginSchema(tv)),
        defaultValues: { email: "", password: "" },
    })

    async function onSubmit(values: LoginFormValues) {
        try {
            const result = await login(values)

            if (result.success) {
                const next = nextPathSchema.safeParse(searchParams.get("next"))

                setUser(result.data)
                router.replace(next.success ? next.data : "/")
                return
            }

            loginFields.forEach(({ name }) => {
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
                    <form id="login-form" autoComplete="off" onSubmit={form.handleSubmit(onSubmit)}>
                        <FieldGroup>
                            {loginFields.map((loginField) => {

                                return (
                                    <Controller
                                        key={loginField.name}
                                        name={loginField.name}
                                        control={form.control}
                                        render={({ field, fieldState }) => {

                                            return (
                                                <Field data-invalid={fieldState.invalid}>
                                                    <FieldLabel htmlFor={`login-${loginField.name}`}>
                                                        {t(loginField.name)}
                                                    </FieldLabel>
                                                    <Input
                                                        {...field}
                                                        id={`login-${loginField.name}`}
                                                        type={loginField.type}
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
                        form="login-form"
                        className="w-full"
                        disabled={form.formState.isSubmitting}
                    >
                        {t("submit")}
                    </Button>
                    <Link
                        href="/auth/register"
                        className={buttonVariants({ variant: "link" })}
                    >
                        {t("register")}
                    </Link>
                </CardFooter>
            </Card>
        </div>
    )
}
