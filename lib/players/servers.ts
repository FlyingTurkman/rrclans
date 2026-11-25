import "server-only"
import { Prisma } from "@prisma/client"
import type { AddServerResult } from "@/lib/clans/servers"
import { prisma } from "@/lib/prisma"
import { isServerActive } from "@/lib/src/serverLifetime"

/**
 * Assigns a player to an active server. A player can have many servers.
 * Does not check permissions: the calling server action must do that and
 * validate both ids (`objectIdSchema`).
 */
export async function addServerToPlayer(userId: string, serverId: string): Promise<AddServerResult> {
    const [user, server] = await Promise.all([
        prisma.user.findUnique({ where: { id: userId }, select: { id: true } }),
        prisma.server.findUnique({ where: { id: serverId }, select: { beganAt: true } }),
    ])

    if (!user || !server) return "notFound"
    if (!isServerActive(server.beganAt)) return "notActive"

    try {
        await prisma.userServer.create({ data: { userId, serverId } })

        return "added"
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return "alreadyAdded"

        throw error
    }
}

/** Removes a player from a server. Does not check permissions. */
export async function removeServerFromPlayer(userId: string, serverId: string): Promise<void> {
    await prisma.userServer.deleteMany({ where: { userId, serverId } })
}
