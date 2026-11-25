'use client'

import { useState, useTransition, type ReactElement, type ReactNode } from "react"
import { useTranslations } from "next-intl"
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
import type { ActionResult } from "@/types"









type ConfirmDialogProps = {
    // Button that opens the dialog and its content.
    trigger: ReactElement
    children: ReactNode
    title: string
    description: string
    confirmLabel: string
    onConfirm: () => Promise<ActionResult>
    onSuccess: () => void
}

// Asks before a destructive action and shows its error.
export default function ConfirmDialog({ trigger, children, title, description, confirmLabel, onConfirm, onSuccess }: ConfirmDialogProps) {
    const t = useTranslations("ConfirmDialog")

    const [open, setOpen] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()

    function handleOpenChange(newOpen: boolean) {
        setError(null)
        setOpen(newOpen)
    }

    function handleConfirm() {
        startTransition(async () => {
            try {
                const result = await onConfirm()

                if (result.success) {
                    setOpen(false)
                    onSuccess()
                } else {
                    setError(result.error ?? t("error"))
                }
            } catch {
                setError(t("error"))
            }
        })
    }

    return (
        <AlertDialog
        open={open}
        onOpenChange={handleOpenChange}
        >
            <AlertDialogTrigger render={trigger}>
                {children}
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>{t("cancel")}</AlertDialogCancel>
                    <AlertDialogAction
                    variant="destructive"
                    disabled={isPending}
                    onClick={handleConfirm}
                    >
                        {confirmLabel}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
