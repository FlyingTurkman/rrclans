import { NextResponse, type NextRequest } from "next/server"
import {
    ACCESS_TOKEN_COOKIE,
    ACCESS_TOKEN_TTL,
    AUTH_COOKIE_OPTIONS,
    REFRESH_TOKEN_COOKIE,
    REFRESH_TOKEN_TTL,
} from "@/lib/auth/config"
import { rotateRefreshToken, verifyAccessToken } from "@/lib/auth/tokens"
import type { AccessTokenPayload } from "@/types"

// Routes that require a logged-in user. Visitors are sent to the login page.
const PROTECTED_ROUTES = ["/profile", "/notifications"]

// Routes only for visitors. Logged-in users are sent to the home page.
const GUEST_ONLY_ROUTES = ["/auth/login", "/auth/register"]

const LOGIN_ROUTE = "/auth/login"

function matches(pathname: string, routes: string[]) {
    return routes.some((route) => pathname === route || pathname.startsWith(`${route}/`))
}

/**
 * Runs before every page request:
 * 1. Looks up the access token cookie in the database.
 * 2. If the access token is missing/expired, silently refreshes it with the
 *    refresh token cookie (rotation) and writes the new cookies.
 * 3. Redirects based on PROTECTED_ROUTES / GUEST_ONLY_ROUTES.
 *
 * Proxy is not a security boundary on its own: server actions must still
 * check the session themselves (see lib/auth/session.ts).
 */
export async function proxy(request: NextRequest) {
    const { pathname, search } = request.nextUrl

    // Server actions are POSTs to the current page and must not be sent away
    // from a guest-only page right after logging in.
    const isNavigation = request.method === "GET" || request.method === "HEAD"

    const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value
    const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value

    let session: AccessTokenPayload | null = null
    let newTokens: { accessToken: string, refreshToken: string } | null = null
    let clearCookies = false

    // Both token checks hit the database: on failure continue as a visitor
    // instead of failing every page.
    try {
        session = accessToken ? await verifyAccessToken(accessToken) : null
    } catch (error) {
        console.error("proxy: access token check failed", error)
    }

    if (!session && refreshToken) {
        try {
            const rotated = await rotateRefreshToken(refreshToken, request.headers.get("user-agent"))

            if (rotated.status === "rotated") {
                session = rotated.user
                newTokens = {
                    accessToken: rotated.accessToken,
                    refreshToken: rotated.refreshToken,
                }
            } else if (rotated.status === "concurrent") {
                session = rotated.user
            } else {
                clearCookies = true
            }
        } catch (error) {
            // Database or config problem: keep the cookies and continue as a
            // visitor instead of failing every page.
            console.error("proxy: session refresh failed", error)
        }
    }

    let response: NextResponse

    if (!session && matches(pathname, PROTECTED_ROUTES)) {
        const loginUrl = new URL(LOGIN_ROUTE, request.url)
        loginUrl.searchParams.set("next", `${pathname}${search}`)
        response = NextResponse.redirect(loginUrl)
    } else if (session && isNavigation && matches(pathname, GUEST_ONLY_ROUTES)) {
        response = NextResponse.redirect(new URL("/", request.url))
    } else {
        // Forward refreshed cookies to the page render of this same request,
        // so server components already see the new access token.
        if (newTokens) {
            request.cookies.set(ACCESS_TOKEN_COOKIE, newTokens.accessToken)
            request.cookies.set(REFRESH_TOKEN_COOKIE, newTokens.refreshToken)
        }

        if (clearCookies) {
            request.cookies.delete(ACCESS_TOKEN_COOKIE)
            request.cookies.delete(REFRESH_TOKEN_COOKIE)
        }

        response = NextResponse.next({ request: { headers: request.headers } })
    }

    if (newTokens) {
        response.cookies.set(ACCESS_TOKEN_COOKIE, newTokens.accessToken, { ...AUTH_COOKIE_OPTIONS, maxAge: ACCESS_TOKEN_TTL })
        response.cookies.set(REFRESH_TOKEN_COOKIE, newTokens.refreshToken, { ...AUTH_COOKIE_OPTIONS, maxAge: REFRESH_TOKEN_TTL })
    }

    if (clearCookies) {
        response.cookies.delete(ACCESS_TOKEN_COOKIE)
        response.cookies.delete(REFRESH_TOKEN_COOKIE)
    }

    return response
}

export const config = {
    matcher: [
        // Everything except Next.js internals and static files.
        "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
    ],
}
