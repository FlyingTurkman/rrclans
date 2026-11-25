import "server-only"
import type { NotificationType } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { nextPathSchema } from "@/lib/schemas/auth.schema"
import type { NotificationParams } from "@/types"

type CreateNotificationsInput = {
    userIds: string[]
    type: NotificationType
    params: NotificationParams
    // Page on this site that opens on click, leave it out to open nothing.
    href?: string
    // What it is about, see Notification.sourceKey.
    sourceKey: string
}

/**
 * Sends a notification to users. Never throws: a failed notification must not
 * undo or hide the result of the action that sends it.
 */
export async function createNotifications({ userIds, type, params, href, sourceKey }: CreateNotificationsInput): Promise<void> {
    if (userIds.length === 0) return

    try {
        const safeHref = href === undefined ? null : nextPathSchema.parse(href)

        await prisma.notification.deleteMany({ where: { userId: { in: userIds }, sourceKey, isRead: false } })
        await prisma.notification.createMany({
            data: userIds.map((userId) => ({ userId, type, params, href: safeHref, sourceKey })),
        })
    } catch (error) {
        console.error("createNotifications failed", error)
    }
}
