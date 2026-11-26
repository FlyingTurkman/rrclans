import "server-only"
import { Prisma } from "@prisma/client"
import { PlayerLocationDto } from "@/dtos/playerLocationDTO"
import { ServerDto } from "@/dtos/serverDTO"
import { prisma } from "@/lib/prisma"
import { pageLimit } from "@/lib/src/constants"
import { getActiveServerRange, isServerActive } from "@/lib/src/serverLifetime"
import type { PlayerLocation, PlayerServers } from "@/types"

export type SetServerResult = "set" | "notFound" | "notActive"

const MAX_ATTEMPTS = 3

/**
 * Makes a server the only active one of a player. The old one stays as history.
 * Does not check permissions: the calling server action must do that and
 * validate both ids (`objectIdSchema`).
 */
export async function setPlayerServer(userId: string, serverId: string): Promise<SetServerResult> {
    const [user, server] = await Promise.all([
        prisma.user.findUnique({ where: { id: userId }, select: { id: true } }),
        prisma.server.findUnique({ where: { id: serverId }, select: { beganAt: true } }),
    ])

    if (!user || !server) return "notFound"
    if (!isServerActive(server.beganAt)) return "notActive"

    for (let attempt = 1; ; attempt++) {
        try {
            await prisma.$transaction(async (tx) => {
                // Writing the user makes parallel calls conflict, so a player
                // never ends up with two active servers.
                await tx.user.update({ where: { id: userId }, data: { updatedAt: new Date() }, select: { id: true } })

                await tx.userServer.updateMany({
                    where: { userId, isActive: true, serverId: { not: serverId } },
                    data: { isActive: false },
                })
                await tx.userServer.upsert({
                    where: { userId_serverId: { userId, serverId } },
                    create: { userId, serverId, isActive: true },
                    update: { isActive: true },
                })
            })

            return "set"
        } catch (error) {
            const isConflict = error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034"

            if (!isConflict || attempt >= MAX_ATTEMPTS) throw error
        }
    }
}

/** Leaves the active server, it stays as history. Does not check permissions. */
export async function leavePlayerServer(userId: string): Promise<void> {
    await prisma.userServer.updateMany({ where: { userId, isActive: true }, data: { isActive: false } })
}

/** Active server of a player, null if there is none or its lifetime has ended. */
export async function getActivePlayerServer(userId: string) {
    const record = await prisma.userServer.findFirst({
        where: { userId, isActive: true, server: { beganAt: getActiveServerRange() } },
        include: { server: true },
    })

    return record?.server ?? null
}

/**
 * Saves the location of a player on their active server, the other servers keep
 * their own. Does not check permissions: the calling server action must do that
 * and validate the ids and the location.
 */
export async function setPlayerLocation(userId: string, serverId: string, location: PlayerLocation): Promise<SetServerResult> {
    const record = await prisma.userServer.findUnique({
        where: { userId_serverId: { userId, serverId } },
        select: { id: true, server: { select: { beganAt: true } } },
    })

    if (!record) return "notFound"
    if (!isServerActive(record.server.beganAt)) return "notActive"

    const { count } = await prisma.userServer.updateMany({
        where: { id: record.id, isActive: true },
        data: { district: location.district, settlement: location.settlement },
    })

    return count > 0 ? "set" : "notActive"
}

/** Location of a player on one server. Does not check permissions. */
export async function getPlayerLocation(userId: string, serverId: string): Promise<PlayerLocationDto | null> {
    const record = await prisma.userServer.findUnique({
        where: { userId_serverId: { userId, serverId } },
        select: { district: true, settlement: true },
    })

    return record ? { ...new PlayerLocationDto(record) } : null
}

/**
 * Active server of a player and the others as history, last played first. The
 * chosen server becomes history when its lifetime ends.
 */
export async function getPlayerServers(userId: string): Promise<PlayerServers> {
    const records = await prisma.userServer.findMany({
        where: { userId },
        orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
        take: pageLimit,
        include: { server: true },
    })

    const active = records.find(({ isActive, server }) => isActive && isServerActive(server.beganAt))

    return {
        server: active ? { ...new ServerDto(active.server) } : null,
        history: records.filter((record) => record !== active).map(({ server }) => ({ ...new ServerDto(server) })),
    }
}
