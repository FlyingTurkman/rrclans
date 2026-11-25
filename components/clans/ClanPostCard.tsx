'use client'

import { useState, useTransition } from "react"
import Link from "next/link"
import { useFormatter, useTranslations } from "next-intl"
import { IoPencil, IoTrash } from "react-icons/io5"
import { deleteClanPost } from "@/actions/clan-posts/delete-clan-post"
import RichTextContent from "@/components/editor/RichTextContent"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import UserAvatar from "@/components/user/UserAvatar"
import type { ClanPostDto } from "@/dtos/clanPostDTO"









type ClanPostCardProps = {
    post: ClanPostDto
    onEdit: () => void
    onDeleted: () => void
}

export default function ClanPostCard({ post, onEdit, onDeleted }: ClanPostCardProps) {
    const t = useTranslations("ClanWall")
    const format = useFormatter()

    const [open, setOpen] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isDeleting, startDelete] = useTransition()

    function handleOpenChange(newOpen: boolean) {
        setError(null)
        setOpen(newOpen)
    }

    function handleDelete() {
        startDelete(async () => {
            try {
                const result = await deleteClanPost(post.id)

                if (result.success) {
                    setOpen(false)
                    onDeleted()
                } else {
                    setError(result.error ?? t("actionError"))
                }
            } catch {
                setError(t("actionError"))
            }
        })
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg break-words">{post.title}</CardTitle>
                <CardDescription className="flex flex-wrap items-center gap-2">
                    <Link
                    href={`/p/${post.author.id}`}
                    className="flex items-center gap-2 font-medium hover:underline"
                    >
                        <UserAvatar
                        username={post.author.username}
                        avatar={post.author.avatar}
                        size="sm"
                        />
                        {post.author.username}
                    </Link>
                    {format.dateTime(post.createdAt, { dateStyle: "long", timeStyle: "short" })}
                </CardDescription>
                {(post.canEdit || post.canDelete) && (
                    <CardAction className="flex gap-1">
                        {post.canEdit && (
                            <Button
                            variant="ghost"
                            size="icon"
                            aria-label={t("edit")}
                            onClick={onEdit}
                            >
                                <IoPencil/>
                            </Button>
                        )}
                        {post.canDelete && (
                            <AlertDialog
                            open={open}
                            onOpenChange={handleOpenChange}
                            >
                                <AlertDialogTrigger
                                render={<Button variant="ghost" size="icon" aria-label={t("delete")}/>}
                                >
                                    <IoTrash/>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>{t("deleteTitle")}</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            {t("deleteDescription", { title: post.title })}
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    {error && <p className="text-sm text-destructive">{error}</p>}
                                    <AlertDialogFooter>
                                        <AlertDialogCancel disabled={isDeleting}>{t("cancel")}</AlertDialogCancel>
                                        <AlertDialogAction
                                        variant="destructive"
                                        disabled={isDeleting}
                                        onClick={handleDelete}
                                        >
                                            {t("delete")}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                    </CardAction>
                )}
            </CardHeader>
            <CardContent>
                <RichTextContent html={post.content}/>
            </CardContent>
        </Card>
    )
}
