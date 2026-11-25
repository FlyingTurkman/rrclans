"use server"

import { headers } from "next/headers"
import { getTranslations } from "next-intl/server"
import { hashPassword, verifyPassword } from "@/lib/auth/password"
import { getSession, startSession } from "@/lib/auth/session"
import { revokeAllRefreshTokens } from "@/lib/auth/tokens"
import { prisma } from "@/lib/prisma"
import { createChangePasswordSchema, type ChangePasswordFormValues } from "@/lib/schemas/change-password.schema"
import { toFieldErrors } from "@/lib/validation"
import type { ActionResult } from "@/types"

/**
 * Changes the password of the logged-in user. Logs out every other device and
 * starts a new session on this one.
 */
export async function changePassword(input: ChangePasswordFormValues): Promise<ActionResult> {
    const tv = await getTranslations("Validation")
    const te = await getTranslations("AuthErrors")

    const parsed = createChangePasswordSchema(tv).safeParse(input)

    if (!parsed.success) return { success: false, fieldErrors: toFieldErrors(parsed.error) }

    const { currentPassword, newPassword } = parsed.data

    try {
        const session = await getSession()
        const current = session && await prisma.user.findUnique({
            where: { id: session.userId },
            select: { id: true, username: true, password: true },
        })

        if (!current) return { success: false, error: te("unauthorized") }

        if (!await verifyPassword(current.password, currentPassword)) {
            return { success: false, fieldErrors: { currentPassword: te("wrongPassword") } }
        }

        await prisma.user.update({
            where: { id: current.id },
            data: { password: await hashPassword(newPassword) },
        })

        await revokeAllRefreshTokens(current.id)
        await startSession({ userId: current.id, username: current.username }, (await headers()).get("user-agent"))

        return { success: true, data: undefined }
    } catch (error) {
        console.error("changePassword failed", error)

        return { success: false, error: te("unknown") }
    }
}
