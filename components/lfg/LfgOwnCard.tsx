'use client'

import { useState, useTransition, type ReactNode } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ActionResult } from "@/types"









type LfgOwnCardProps = {
    title: string
    // Text of the current listing, null if there is none.
    message: string | null
    // The listing has changed: load it again.
    onChanged: () => void
    onDelete: () => Promise<ActionResult>
    renderForm: (close: () => void) => ReactNode
}

// Own listing on /lfc and /lfp: create, edit and delete.
export default function LfgOwnCard({ title, message, onChanged, onDelete, renderForm }: LfgOwnCardProps) {
    const t = useTranslations("Lfg")
    const te = useTranslations("AuthErrors")

    const [isEditing, setIsEditing] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isDeleting, startDelete] = useTransition()

    function handleDelete() {
        setError(null)

        startDelete(async () => {
            try {
                const result = await onDelete()

                if (result.success) {
                    onChanged()
                } else {
                    setError(result.error ?? te("unknown"))
                }
            } catch {
                setError(te("unknown"))
            }
        })
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                {isEditing ? renderForm(() => setIsEditing(false)) : (
                    <>
                        <p className={message ? "break-words whitespace-pre-wrap" : "text-muted-foreground"}>
                            {message ?? t("noListing")}
                        </p>
                        {error && <p className="text-destructive">{error}</p>}
                        <div className="flex gap-2">
                            <Button
                            disabled={isDeleting}
                            onClick={() => setIsEditing(true)}
                            >
                                {message ? t("edit") : t("create")}
                            </Button>
                            {message && (
                                <Button
                                variant="destructive"
                                disabled={isDeleting}
                                onClick={handleDelete}
                                >
                                    {t("delete")}
                                </Button>
                            )}
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    )
}
