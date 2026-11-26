"use server"

import { getTranslations } from "next-intl/server"
import { getClanAccess } from "@/lib/clans/access"
import { prisma } from "@/lib/prisma"
import { objectIdSchema } from "@/lib/schemas/auth.schema"
import { createLfpSchema, type LfpFormValues } from "@/lib/schemas/lfp.schema"
import { getActiveServerRange } from "@/lib/src/serverLifetime"
import { toFieldErrors } from "@/lib/validation"
import type { ActionResult } from "@/types"

/**
 * Creates or changes the listing of a clan (leader and officers, one per clan).
 * Its servers must be active servers of the clan.
 */
export async function saveLfpListing(clanId: string, input: LfpFormValues): Promise<ActionResult> {
    const t = await getTranslations("LfpPage")
    const tv = await getTranslations("Validation")
    const te = await getTranslations("AuthErrors")

    const parsedId = objectIdSchema.safeParse(clanId)
    const parsed = createLfpSchema(tv).safeParse(input)

    if (!parsedId.success) return { success: false, error: te("unknown") }
    if (!parsed.success) return { success: false, fieldErrors: toFieldErrors(parsed.error) }

    const { message, role, serverIds } = parsed.data

    try {
        const access = await getClanAccess(parsedId.data)

        if (!access?.isManager) return { success: false, error: t("forbidden") }

        const clanServers = await prisma.clanServer.count({
            where: { clanId: parsedId.data, serverId: { in: serverIds }, server: { beganAt: getActiveServerRange() } },
        })

        if (clanServers !== serverIds.length) return { success: false, fieldErrors: { serverIds: t("serverNotInClan") } }

        await prisma.lfpListing.upsert({
            where: { clanId: parsedId.data },
            create: { clanId: parsedId.data, message, role, serverIds },
            update: { message, role, serverIds },
        })

        return { success: true, data: undefined }
    } catch (error) {
        console.error("saveLfpListing failed", error)

        return { success: false, error: te("unknown") }
    }
}
