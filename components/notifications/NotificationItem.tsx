'use client'

import Link from "next/link"
import { useFormatter, useTranslations } from "next-intl"
import { markNotificationsRead } from "@/actions/notifications/mark-notifications-read"
import { useSiteContext } from "@/context/SiteContext"
import type { NotificationDto } from "@/dtos/notificationDTO"
import { cn } from "@/lib/utils"









type NotificationItemProps = {
    notification: NotificationDto
    // Called after a click, the notification is then read.
    onRead: (id: string) => void
    // Called when a click opens a page.
    onNavigate?: () => void
}

// One notification. A click marks it as read and opens its page, if it has one.
export default function NotificationItem({ notification, onRead, onNavigate }: NotificationItemProps) {
    const t = useTranslations("Notifications")
    const tr = useTranslations("ClanRoles")
    const format = useFormatter()
    const { reloadUnreadCount } = useSiteContext()

    const { clan, player, role } = notification.params

    function handleRead() {
        if (notification.isRead) return

        onRead(notification.id)

        markNotificationsRead(notification.id)
            .then(reloadUnreadCount)
            .catch(() => undefined)
    }

    const className = cn(
        "flex w-full items-start gap-2 rounded-md p-2 text-left text-sm transition-colors hover:bg-accent",
        notification.isRead && "opacity-60"
    )

    const content = (
        <>
            <span
            aria-hidden
            className={cn("mt-1.5 size-2 shrink-0 rounded-full", !notification.isRead && "bg-primary")}
            />
            <span className="min-w-0">
                <span className="block break-words">
                    {!notification.isRead && <span className="sr-only">{t("unread")} </span>}
                    {t(`types.${notification.type}`, { clan: clan ?? "", player: player ?? "", role: role ? tr(role) : "" })}
                </span>
                <span className="block text-xs text-muted-foreground">
                    {format.dateTime(notification.createdAt, { dateStyle: "medium", timeStyle: "short" })}
                </span>
            </span>
        </>
    )

    if (!notification.href) {
        return (
            <button
            type="button"
            className={className}
            onClick={handleRead}
            >
                {content}
            </button>
        )
    }

    return (
        <Link
        href={notification.href}
        className={className}
        onClick={() => {
            handleRead()
            onNavigate?.()
        }}
        >
            {content}
        </Link>
    )
}
