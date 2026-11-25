"use server"

import { getSession } from "@/lib/auth/session"
import { prisma } from "@/lib/prisma"
import type { ActionResult } from "@/types"

/** Number of unread notifications of the logged-in user. */
export async function getUnreadCount(): Promise<ActionResult<number>> {
    try {
        const session = await getSession()

        if (!session) return { success: true, data: 0 }

        return { success: true, data: await prisma.notification.count({ where: { userId: session.userId, isRead: false } }) }
    } catch (error) {
        console.error("getUnreadCount failed", error)

        return { success: false }
    }
}
