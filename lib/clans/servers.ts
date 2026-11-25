import "server-only"
import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { isServerActive } from "@/lib/src/serverLifetime"

export type AddServerResult = "added" | "alreadyAdded" | "notFound" | "notActive"

/**
 * Adds an active server to a clan. A clan can have many servers.
 * Does not check permissions: the calling server action must do that and
 * validate both ids (`objectIdSchema`).
 */
export async function addServerToClan(clanId: string, serverId: string): Promise<AddServerResult> {
    const [clan, server] = await Promise.all([
        prisma.clan.findUnique({ where: { id: clanId }, select: { id: true } }),
        prisma.server.findUnique({ where: { id: serverId }, select: { beganAt: true } }),
    ])

    if (!clan || !server) return "notFound"
    if (!isServerActive(server.beganAt)) return "notActive"

    try {
        await prisma.clanServer.create({ data: { clanId, serverId } })

        return "added"
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return "alreadyAdded"

        throw error
    }
}

/** Removes a server from a clan. Does not check permissions. */
export async function removeServerFromClan(clanId: string, serverId: string): Promise<void> {
    await prisma.clanServer.deleteMany({ where: { clanId, serverId } })
}
