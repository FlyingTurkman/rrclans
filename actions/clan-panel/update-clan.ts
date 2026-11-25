"use server"

import { getTranslations } from "next-intl/server"
import { Prisma } from "@prisma/client"
import { getClanAccess } from "@/lib/clans/access"
import { prisma } from "@/lib/prisma"
import { objectIdSchema } from "@/lib/schemas/auth.schema"
import { createClanSchema, type ClanFormValues } from "@/lib/schemas/clan.schema"
import { toFieldErrors } from "@/lib/validation"
import type { ActionResult } from "@/types"

/** Changes the information of a clan (leader and officers). */
export async function updateClan(clanId: string, input: ClanFormValues): Promise<ActionResult> {
    const t = await getTranslations("ClanPanel")
    const tv = await getTranslations("Validation")

    const parsedId = objectIdSchema.safeParse(clanId)
    const parsed = createClanSchema(tv).safeParse(input)

    if (!parsedId.success) return { success: false, error: t("actionError") }
    if (!parsed.success) return { success: false, fieldErrors: toFieldErrors(parsed.error) }

    const { clanName, clanTag, region, joinMode } = parsed.data

    try {
        const access = await getClanAccess(parsedId.data)

        if (!access?.isManager) return { success: false, error: t("forbidden") }

        await prisma.clan.update({ where: { id: parsedId.data }, data: { clanName, clanTag, region, joinMode } })

        return { success: true, data: undefined }
    } catch (error) {
        // The tag is the only unique field changed here.
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
            return { success: false, fieldErrors: { clanTag: t("tagTaken") } }
        }

        console.error("updateClan failed", error)

        return { success: false, error: t("actionError") }
    }
}
