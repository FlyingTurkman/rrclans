"use server"

import { getTranslations } from "next-intl/server"
import { getSession } from "@/lib/auth/session"
import { prisma } from "@/lib/prisma"
import type { ActionResult } from "@/types"

/** Deletes the listing of the logged-in user. */
export async function deleteLfcListing(): Promise<ActionResult> {
    const te = await getTranslations("AuthErrors")

    try {
        const session = await getSession()

        if (!session) return { success: false, error: te("unauthorized") }

        await prisma.lfcListing.deleteMany({ where: { userId: session.userId } })

        return { success: true, data: undefined }
    } catch (error) {
        console.error("deleteLfcListing failed", error)

        return { success: false, error: te("unknown") }
    }
}
