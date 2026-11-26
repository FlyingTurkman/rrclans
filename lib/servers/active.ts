import "server-only"
import type { Server } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { getActiveServerRange } from "@/lib/src/serverLifetime"

/** Active servers with these ids, by id. Expired and unknown ids are left out. */
export async function getActiveServersById(ids: string[]): Promise<Map<string, Server>> {
    if (ids.length === 0) return new Map()

    const servers = await prisma.server.findMany({
        where: { id: { in: [...new Set(ids)] }, beganAt: getActiveServerRange() },
    })

    return new Map(servers.map((server) => [server.id, server]))
}

/** Servers of `ids` in the map, newest first. */
export function pickServers(ids: string[], servers: Map<string, Server>): Server[] {
    return ids
        .map((id) => servers.get(id))
        .filter((server): server is Server => !!server)
        .sort((a, b) => b.beganAt.getTime() - a.beganAt.getTime())
}
