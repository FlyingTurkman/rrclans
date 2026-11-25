"use server"

import { getTranslations } from "next-intl/server"
import { NotificationDto } from "@/dtos/notificationDTO"
import { getSession } from "@/lib/auth/session"
import { prisma } from "@/lib/prisma"
import { notificationQuerySchema } from "@/lib/schemas/notification-query.schema"
import { pageLimit } from "@/lib/src/constants"
import type { ActionResult, NotificationList } from "@/types"

/** One page of notifications of the logged-in user, newest first. */
export async function getNotifications(input: unknown): Promise<ActionResult<NotificationList>> {
    const te = await getTranslations("AuthErrors")

    const parsed = notificationQuerySchema.safeParse(input)

    if (!parsed.success) return { success: false, error: te("unknown") }

    const { page } = parsed.data

    try {
        const session = await getSession()

        if (!session) return { success: false, error: te("unauthorized") }

        const where = { userId: session.userId }

        const [notifications, total] = await Promise.all([
            prisma.notification.findMany({
                where,
                orderBy: [{ createdAt: "desc" }, { id: "desc" }],
                skip: (page - 1) * pageLimit,
                take: pageLimit,
            }),
            prisma.notification.count({ where }),
        ])

        return {
            success: true,
            data: {
                notifications: notifications.map((notification) => ({ ...new NotificationDto(notification) })),
                total,
                pageCount: Math.max(1, Math.ceil(total / pageLimit)),
            },
        }
    } catch (error) {
        console.error("getNotifications failed", error)

        return { success: false, error: te("unknown") }
    }
}
