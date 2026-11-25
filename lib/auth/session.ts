import "server-only"
import { cookies } from "next/headers"
import type { AccessTokenPayload } from "@/types"
import {
    ACCESS_TOKEN_COOKIE,
    ACCESS_TOKEN_TTL,
    AUTH_COOKIE_OPTIONS,
    REFRESH_TOKEN_COOKIE,
    REFRESH_TOKEN_TTL,
} from "./config"
import { createSessionTokens, verifyAccessToken } from "./tokens"

/** Writes the access and refresh token cookies. */
export async function setAuthCookies(accessToken: string, refreshToken: string) {
    const store = await cookies()

    store.set(ACCESS_TOKEN_COOKIE, accessToken, { ...AUTH_COOKIE_OPTIONS, maxAge: ACCESS_TOKEN_TTL })
    store.set(REFRESH_TOKEN_COOKIE, refreshToken, { ...AUTH_COOKIE_OPTIONS, maxAge: REFRESH_TOKEN_TTL })
}

/** Removes both auth cookies. */
export async function clearAuthCookies() {
    const store = await cookies()

    store.delete(ACCESS_TOKEN_COOKIE)
    store.delete(REFRESH_TOKEN_COOKIE)
}

/**
 * Starts a session after a successful login or register:
 * issues both tokens and stores them in cookies.
 */
export async function startSession(user: AccessTokenPayload, userAgent?: string | null) {
    const { accessToken, refreshToken } = await createSessionTokens(user.userId, userAgent)

    await setAuthCookies(accessToken, refreshToken)
}

/** Returns the logged-in user from the access token cookie, or null. */
export async function getSession(): Promise<AccessTokenPayload | null> {
    const token = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value

    if (!token) return null

    return verifyAccessToken(token)
}
