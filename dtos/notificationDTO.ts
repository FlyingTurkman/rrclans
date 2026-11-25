import type { Notification, NotificationParams, NotificationType } from "@/types"









export class NotificationDto {
    id: string
    type: NotificationType
    params: NotificationParams
    // Page that opens on click, null opens nothing.
    href: string | null
    isRead: boolean
    createdAt: Date

    constructor(data: Notification) {
        this.id = data.id
        this.type = data.type
        this.params = data.params as NotificationParams
        this.href = data.href ?? null
        this.isRead = data.isRead
        this.createdAt = data.createdAt
    }
}
