'use client'

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { getNotifications } from "@/actions/notifications/get-notifications"
import { markNotificationsRead } from "@/actions/notifications/mark-notifications-read"
import ListPagination from "@/components/layout/ListPagination"
import NotificationItem from "@/components/notifications/NotificationItem"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { useSiteContext } from "@/context/SiteContext"
import { notificationQuerySchema } from "@/lib/schemas/notification-query.schema"
import type { ActionResult, NotificationList } from "@/types"









// Result of the last request, the page and the user it belongs to.
type LoadedNotifications = {
    page: number
    viewerId: string
    result: ActionResult<NotificationList>
}

export default function NotificationsPageClient() {
    const t = useTranslations("Notifications")
    const searchParams = useSearchParams()
    const { user, unreadCount, reloadUnreadCount } = useSiteContext()
    const viewerId = user?.id

    const { page } = useMemo(() => notificationQuerySchema.parse(Object.fromEntries(searchParams)), [searchParams])

    const [loaded, setLoaded] = useState<LoadedNotifications | null>(null)

    useEffect(() => {
        if (!viewerId) return

        let cancelled = false

        getNotifications({ page })
            .catch((): ActionResult<NotificationList> => ({ success: false }))
            .then((result) => {
                if (!cancelled) setLoaded({ page, viewerId, result })
            })

        return () => {
            cancelled = true
        }
    }, [page, viewerId])

    const result = loaded?.page === page && loaded.viewerId === viewerId ? loaded.result : null

    // Without an id every notification is marked.
    function handleRead(id?: string) {
        setLoaded((current) => {
            if (!current?.result.success) return current

            const { data } = current.result
            const notifications = data.notifications.map((item) => (!id || item.id === id ? { ...item, isRead: true } : item))

            return { ...current, result: { success: true, data: { ...data, notifications } } }
        })
    }

    function handleReadAll() {
        handleRead()

        markNotificationsRead()
            .then(reloadUnreadCount)
            .catch(() => undefined)
    }

    return (
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h1 className="font-heading text-3xl font-extrabold italic uppercase font-stretch-condensed">
                    {t("title")}
                </h1>
                <Button
                variant="outline"
                disabled={unreadCount === 0}
                onClick={handleReadAll}
                >
                    {t("readAll")}
                </Button>
            </div>

            {!result && (
                <div className="flex justify-center py-10">
                    <Spinner className="size-6" aria-label={t("loading")}/>
                </div>
            )}

            {result && !result.success && (
                <p className="text-destructive">{result.error ?? t("loadError")}</p>
            )}

            {result?.success && result.data.notifications.length === 0 && (
                <p className="text-muted-foreground">{t("empty")}</p>
            )}

            {result?.success && result.data.notifications.length > 0 && (
                <ul className="flex flex-col gap-1">
                    {result.data.notifications.map((notification) => {

                        return (
                            <li key={notification.id}>
                                <NotificationItem
                                notification={notification}
                                onRead={handleRead}
                                />
                            </li>
                        )
                    })}
                </ul>
            )}

            {result?.success && (
                <ListPagination
                page={page}
                pageCount={result.data.pageCount}
                />
            )}
        </div>
    )
}
