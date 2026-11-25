"use server"

import { getTranslations } from "next-intl/server"
import { getSession } from "@/lib/auth/session"
import { prisma } from "@/lib/prisma"
import type { LfcFormValues } from "@/lib/schemas/lfc.schema"
import type { ActionResult } from "@/types"

/** Listing of the logged-in user, or null if there is none. */
export async function getMyLfcListing(): Promise<ActionResult<LfcFormValues | null>> {
    const te = await getTranslations("AuthErrors")

    try {
        const session = await getSession()

        if (!session) return { success: false, error: te("unauthorized") }

        const listing = await prisma.lfcListing.findUnique({
            where: { userId: session.userId },
            select: { message: true, region: true },
        })

        return { success: true, data: listing && { message: listing.message, region: listing.region } }
    } catch (error) {
        console.error("getMyLfcListing failed", error)

        return { success: false, error: te("unknown") }
    }
}
