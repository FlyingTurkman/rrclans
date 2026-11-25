import "server-only"
import type { Prisma } from "@prisma/client"
import { ServerDto } from "@/dtos/serverDTO"
import { prisma } from "@/lib/prisma"
import { pageLimit } from "@/lib/src/constants"
import { getActiveServerRange } from "@/lib/src/serverLifetime"

/** Active servers whose name contains the term, newest first. */
export async function findActiveServers(term: string, where: Prisma.ServerWhereInput = {}): Promise<ServerDto[]> {
    const servers = await prisma.server.findMany({
        where: {
            ...where,
            beganAt: getActiveServerRange(),
            ...(term && { serverName: { contains: term, mode: "insensitive" } }),
        },
        orderBy: [{ beganAt: "desc" }, { id: "desc" }],
        take: pageLimit,
    })

    return servers.map((server) => ({ ...new ServerDto(server) }))
}
