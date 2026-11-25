'use client'

import { useState } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { IoNotificationsOutline } from "react-icons/io5"
import { getLatestNotifications } from "@/actions/notifications/get-latest-notifications"
import { markNotificationsRead } from "@/actions/notifications/mark-notifications-read"
import NotificationItem from "@/components/notifications/NotificationItem"
import { Button, buttonVariants } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Spinner } from "@/components/ui/spinner"
import { useSiteContext } from "@/context/SiteContext"
import type { NotificationDto } from "@/dtos/notificationDTO"
import type { ActionResult } from "@/types"









const MAX_COUNT = 99

// Bell in the main menu with the latest notifications. Only for logged-in users.
export default function MainMenuNotifications() {
    const t = useTranslations("Notifications")
    const { user, unreadCount, reloadUnreadCount } = useSiteContext()

    const [open, setOpen] = useState(false)
    const [result, setResult] = useState<ActionResult<NotificationDto[]> | null>(null)

    function handleOpenChange(newOpen: boolean) {
        setOpen(newOpen)

        if (!newOpen) return

        setResult(null)
        reloadUnreadCount()

        getLatestNotifications()
            .catch((): ActionResult<NotificationDto[]> => ({ success: false }))
            .then(setResult)
    }

    // Without an id every notification is marked.
    function handleRead(id?: string) {
        setResult((current) => {
            if (!current?.success) return current

            return {
                success: true,
                data: current.data.map((item) => (!id || item.id === id ? { ...item, isRead: true } : item)),
            }
        })
    }

    function handleReadAll() {
        handleRead()

        markNotificationsRead()
            .then(reloadUnreadCount)
            .catch(() => undefined)
    }

    if (!user) return null

    return (
        <Popover
        open={open}
        onOpenChange={handleOpenChange}
        >
            <PopoverTrigger
            className="relative flex items-center text-xl outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground"
            aria-label={t("open", { count: unreadCount })}
            >
                <IoNotificationsOutline/>
                {unreadCount > 0 && (
                    <span
                    aria-hidden
                    className="absolute -top-2 left-2.5 rounded-full bg-primary-foreground px-1.5 text-[10px] leading-4 font-bold text-primary"
                    >
                        {unreadCount > MAX_COUNT ? `${MAX_COUNT}+` : unreadCount}
                    </span>
                )}
            </PopoverTrigger>
            <PopoverContent
            align="end"
            className="w-80"
            >
                <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">{t("title")}</p>
                    <Button
                    variant="link"
                    size="sm"
                    className="px-0"
                    disabled={unreadCount === 0}
                    onClick={handleReadAll}
                    >
                        {t("readAll")}
                    </Button>
                </div>

                {!result && (
                    <div className="flex justify-center py-4">
                        <Spinner aria-label={t("loading")}/>
                    </div>
                )}

                {result && !result.success && (
                    <p className="py-4 text-center text-sm text-destructive">{result.error ?? t("loadError")}</p>
                )}

                {result?.success && result.data.length === 0 && (
                    <p className="py-4 text-center text-sm text-muted-foreground">{t("empty")}</p>
                )}

                {result?.success && result.data.length > 0 && (
                    <ul className="max-h-80 overflow-y-auto">
                        {result.data.map((notification) => {

                            return (
                                <li key={notification.id}>
                                    <NotificationItem
                                    notification={notification}
                                    onRead={handleRead}
                                    onNavigate={() => setOpen(false)}
                                    />
                                </li>
                            )
                        })}
                    </ul>
                )}

                <Link
                href="/notifications"
                className={buttonVariants({ variant: "outline", className: "w-full" })}
                onClick={() => setOpen(false)}
                >
                    {t("seeAll")}
                </Link>
            </PopoverContent>
        </Popover>
    )
}
