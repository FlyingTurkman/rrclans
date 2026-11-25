'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { useTranslations } from "next-intl"
import { createClanPost } from "@/actions/clan-posts/create-clan-post"
import { updateClanPost } from "@/actions/clan-posts/update-clan-post"
import RichTextEditor from "@/components/editor/RichTextEditor"
import { createEmptyDocument } from "@/components/rte/rte-engine"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import type { ClanPostDto } from "@/dtos/clanPostDTO"
import { createClanPostSchema, POST_TITLE_MAX_LENGTH, type ClanPostFormValues } from "@/lib/schemas/clan-post.schema"
import { postMaxLength } from "@/lib/src/constants"









type ClanPostFormProps = {
    clanId: string
    // Post to edit, without it a new post is written.
    post?: ClanPostDto
    onSaved: () => void
    onCancel: () => void
}

export default function ClanPostForm({ clanId, post, onSaved, onCancel }: ClanPostFormProps) {
    const t = useTranslations("ClanWall")
    const tv = useTranslations("Validation")

    const form = useForm<ClanPostFormValues>({
        resolver: zodResolver(createClanPostSchema(tv)),
        defaultValues: {
            title: post?.title ?? "",
            rawContent: post?.rawContent ?? createEmptyDocument("rte-empty"),
        },
    })

    async function onSubmit(values: ClanPostFormValues) {
        try {
            const result = post ? await updateClanPost(post.id, values) : await createClanPost(clanId, values)

            if (result.success) {
                onSaved()
                return
            }

            for (const name of ["title", "rawContent"] as const) {
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
                <CardTitle>{post ? t("editPost") : t("newPost")}</CardTitle>
            </CardHeader>
            <CardContent>
                <form id="clan-post-form" autoComplete="off" onSubmit={form.handleSubmit(onSubmit)}>
                    <FieldGroup>
                        <Controller
                            name="title"
                            control={form.control}
                            render={({ field, fieldState }) => {

                                return (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="clan-post-title">{t("title")}</FieldLabel>
                                        <Input
                                            {...field}
                                            id="clan-post-title"
                                            maxLength={POST_TITLE_MAX_LENGTH}
                                            autoComplete="off"
                                            aria-invalid={fieldState.invalid}
                                        />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
                                    </Field>
                                )
                            }}
                        />
                        <Controller
                            name="rawContent"
                            control={form.control}
                            render={({ field, fieldState }) => {

                                return (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel>{t("content")}</FieldLabel>
                                        <RichTextEditor
                                            value={field.value}
                                            onValueChange={field.onChange}
                                            maxLength={postMaxLength}
                                            invalid={fieldState.invalid}
                                            label={t("content")}
                                        />
                                        {fieldState.invalid && <FieldError errors={[{ message: fieldState.error?.message }]}/>}
                                    </Field>
                                )
                            }}
                        />
                        {form.formState.errors.root && <FieldError errors={[form.formState.errors.root]}/>}
                    </FieldGroup>
                </form>
            </CardContent>
            <CardFooter className="justify-end gap-2">
                <Button
                    variant="ghost"
                    disabled={form.formState.isSubmitting}
                    onClick={onCancel}
                >
                    {t("cancel")}
                </Button>
                <Button
                    type="submit"
                    form="clan-post-form"
                    disabled={form.formState.isSubmitting}
                >
                    {post ? t("save") : t("publish")}
                </Button>
            </CardFooter>
        </Card>
    )
}
