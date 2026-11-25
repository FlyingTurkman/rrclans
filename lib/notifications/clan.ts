import "server-only"
import type { NotificationType } from "@prisma/client"
import { createNotifications } from "@/lib/notifications/create"
import { prisma } from "@/lib/prisma"
import type { ClanRole } from "@/types"

type ClanEvent = {
    type: NotificationType
    clanId: string
    // Player the event is about, shown in the text.
    playerId?: string
    role?: ClanRole
    // Page to open on click, leave it out to open nothing.
    href?: string
}

/** Sends a notification about a clan to one user. Never throws. */
export async function notifyUser(userId: string, event: ClanEvent): Promise<void> {
    await notify([userId], event)
}

/** Sends a notification about a clan to its leader and officers. Never throws. */
export async function notifyClanManagers(event: ClanEvent): Promise<void> {
    try {
        const managers = await prisma.clanMember.findMany({
            where: { clanId: event.clanId, role: { in: ["LEADER", "OFFICER"] } },
            select: { userId: true },
        })

        await notify(managers.map(({ userId }) => userId), event)
    } catch (error) {
        console.error("notifyClanManagers failed", error)
    }
}

async function notify(userIds: string[], { type, clanId, playerId, role, href }: ClanEvent): Promise<void> {
    try {
        const [clan, player] = await Promise.all([
            prisma.clan.findUnique({ where: { id: clanId }, select: { clanName: true } }),
            playerId ? prisma.user.findUnique({ where: { id: playerId }, select: { username: true } }) : null,
        ])

        if (!clan) return

        await createNotifications({
            userIds,
            type,
            params: {
                clan: clan.clanName,
                ...(player && { player: player.username }),
                ...(role && { role }),
            },
            href,
            sourceKey: [type, clanId, playerId].filter(Boolean).join(":"),
        })
    } catch (error) {
        console.error("notify failed", error)
    }
}
