"use server"

import { getTranslations } from "next-intl/server"
import { NotificationDto } from "@/dtos/notificationDTO"
import { getSession } from "@/lib/auth/session"
import { prisma } from "@/lib/prisma"
import { notificationMenuLimit } from "@/lib/src/constants"
import type { ActionResult } from "@/types"

/** Latest notifications of the logged-in user (main menu). */
export async function getLatestNotifications(): Promise<ActionResult<NotificationDto[]>> {
    const te = await getTranslations("AuthErrors")

    try {
        const session = await getSession()

        if (!session) return { success: false, error: te("unauthorized") }

        const notifications = await prisma.notification.findMany({
            where: { userId: session.userId },
            orderBy: [{ createdAt: "desc" }, { id: "desc" }],
            take: notificationMenuLimit,
        })

        return { success: true, data: notifications.map((notification) => ({ ...new NotificationDto(notification) })) }
    } catch (error) {
        console.error("getLatestNotifications failed", error)

        return { success: false, error: te("unknown") }
    }
}
