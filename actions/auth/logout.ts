"use server"

import { cookies } from "next/headers"
import { getTranslations } from "next-intl/server"
import { REFRESH_TOKEN_COOKIE } from "@/lib/auth/config"
import { clearAuthCookies, getSession } from "@/lib/auth/session"
import { revokeAllRefreshTokens, revokeRefreshToken } from "@/lib/auth/tokens"
import type { ActionResult } from "@/types"

/** Logs out on this device: revokes the refresh token and clears cookies. */
export async function logout(): Promise<ActionResult> {
    const refreshToken = (await cookies()).get(REFRESH_TOKEN_COOKIE)?.value

    if (refreshToken) await revokeRefreshToken(refreshToken)

    await clearAuthCookies()

    return { success: true, data: undefined }
}

/** Logs out on every device by revoking all refresh tokens of the user. */
export async function logoutAllDevices(): Promise<ActionResult> {
    const session = await getSession()

    if (!session) {
        const te = await getTranslations("AuthErrors")

        return { success: false, error: te("unauthorized") }
    }

    await revokeAllRefreshTokens(session.userId)
    await clearAuthCookies()

    return { success: true, data: undefined }
}
