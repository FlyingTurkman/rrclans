'use client'

import type { ReactNode } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { FieldError, FieldGroup } from "@/components/ui/field"









type ProfileFormCardProps = {
    formId: string
    title: string
    description: string
    // Message of the last successful save.
    saved: string | null
    error?: { message?: string }
    isSubmitting: boolean
    onSubmit: () => void
    children: ReactNode
}

// Card around every form of the profile page.
export default function ProfileFormCard({ formId, title, description, saved, error, isSubmitting, onSubmit, children }: ProfileFormCardProps) {
    const t = useTranslations("ProfilePage")

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <form
                id={formId}
                autoComplete="off"
                onSubmit={(event) => {
                    event.preventDefault()
                    onSubmit()
                }}
                >
                    <FieldGroup>
                        {children}
                        {error && <FieldError errors={[error]}/>}
                        {saved && <p role="status" className="text-sm text-primary">{saved}</p>}
                    </FieldGroup>
                </form>
            </CardContent>
            <CardFooter className="justify-end">
                <Button
                type="submit"
                form={formId}
                disabled={isSubmitting}
                >
                    {t("save")}
                </Button>
            </CardFooter>
        </Card>
    )
}
