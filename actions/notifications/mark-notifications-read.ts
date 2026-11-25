"use server"

import { getTranslations } from "next-intl/server"
import { getSession } from "@/lib/auth/session"
import { prisma } from "@/lib/prisma"
import { objectIdSchema } from "@/lib/schemas/auth.schema"
import type { ActionResult } from "@/types"

/** Marks one notification of the logged-in user as read, or all without an id. */
export async function markNotificationsRead(notificationId?: string): Promise<ActionResult> {
    const te = await getTranslations("AuthErrors")

    const parsed = objectIdSchema.optional().safeParse(notificationId)

    if (!parsed.success) return { success: false, error: te("unknown") }

    try {
        const session = await getSession()

        if (!session) return { success: false, error: te("unauthorized") }

        await prisma.notification.updateMany({
            where: { userId: session.userId, isRead: false, ...(parsed.data && { id: parsed.data }) },
            data: { isRead: true },
        })

        return { success: true, data: undefined }
    } catch (error) {
        console.error("markNotificationsRead failed", error)

        return { success: false, error: te("unknown") }
    }
}
