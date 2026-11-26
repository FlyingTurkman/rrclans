"use server"

import { getTranslations } from "next-intl/server"
import { ServerDto } from "@/dtos/serverDTO"
import { getSession } from "@/lib/auth/session"
import { prisma } from "@/lib/prisma"
import { getActiveServersById, pickServers } from "@/lib/servers/active"
import type { ActionResult, OwnLfcListing } from "@/types"

/** Listing of the logged-in user, or null if there is none. Expired servers are dropped. */
export async function getMyLfcListing(): Promise<ActionResult<OwnLfcListing | null>> {
    const te = await getTranslations("AuthErrors")

    try {
        const session = await getSession()

        if (!session) return { success: false, error: te("unauthorized") }

        const listing = await prisma.lfcListing.findUnique({
            where: { userId: session.userId },
            select: { message: true, region: true, serverIds: true },
        })

        if (!listing) return { success: true, data: null }

        const servers = pickServers(listing.serverIds ?? [], await getActiveServersById(listing.serverIds ?? []))

        return {
            success: true,
            data: {
                message: listing.message,
                region: listing.region,
                servers: servers.map((server) => ({ ...new ServerDto(server) })),
            },
        }
    } catch (error) {
        console.error("getMyLfcListing failed", error)

        return { success: false, error: te("unknown") }
    }
}
