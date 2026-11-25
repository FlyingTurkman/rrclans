"use server"

import { cookies, headers } from "next/headers"
import { getTranslations } from "next-intl/server"
import { REFRESH_TOKEN_COOKIE } from "@/lib/auth/config"
import { clearAuthCookies, setAuthCookies } from "@/lib/auth/session"
import { rotateRefreshToken } from "@/lib/auth/tokens"
import type { AccessTokenPayload, ActionResult } from "@/types"

/**
 * Issues a new access token using the refresh token cookie (and rotates the
 * refresh token). Call it when the access token has expired.
 */
export async function refreshSession(): Promise<ActionResult<AccessTokenPayload>> {
    const te = await getTranslations("AuthErrors")
    const refreshToken = (await cookies()).get(REFRESH_TOKEN_COOKIE)?.value

    if (!refreshToken) {
        return { success: false, error: te("sessionExpired") }
    }

    const rotated = await rotateRefreshToken(refreshToken, (await headers()).get("user-agent"))

    if (rotated.status === "invalid") {
        await clearAuthCookies()

        return { success: false, error: te("sessionExpired") }
    }

    // Another request already refreshed the session and set the new cookies.
    if (rotated.status === "concurrent") {
        return { success: true, data: rotated.user }
    }

    await setAuthCookies(rotated.accessToken, rotated.refreshToken)

    return { success: true, data: rotated.user }
}
