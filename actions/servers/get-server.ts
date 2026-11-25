"use server"

import { ServerDto } from "@/dtos/serverDTO"
import { prisma } from "@/lib/prisma"
import { objectIdSchema } from "@/lib/schemas/auth.schema"
import type { ActionResult } from "@/types"

/** One server, null if it does not exist. */
export async function getServer(serverId: unknown): Promise<ActionResult<ServerDto | null>> {
    const parsed = objectIdSchema.safeParse(serverId)

    if (!parsed.success) return { success: true, data: null }

    try {
        const server = await prisma.server.findUnique({ where: { id: parsed.data } })

        return { success: true, data: server && { ...new ServerDto(server) } }
    } catch (error) {
        console.error("getServer failed", error)

        return { success: false }
    }
}
