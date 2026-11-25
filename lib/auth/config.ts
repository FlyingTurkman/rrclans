// Auth settings shared by the token and cookie helpers.

/** Access token lifetime in seconds: 15 minutes. */
export const ACCESS_TOKEN_TTL = 60 * 15

/** Refresh token lifetime in seconds: 30 days. */
export const REFRESH_TOKEN_TTL = 60 * 60 * 24 * 30

export const ACCESS_TOKEN_COOKIE = "access_token"
export const REFRESH_TOKEN_COOKIE = "refresh_token"

/** Random bytes per token (access and refresh): 64 bytes = 86 base64url characters. */
export const AUTH_TOKEN_BYTES = 64

/**
 * A refresh token revoked less than this many seconds ago is treated as a
 * concurrent request (e.g. parallel page requests), not as token theft.
 */
export const REFRESH_TOKEN_REUSE_GRACE = 30

/** Cookie options shared by both auth cookies. */
export const AUTH_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
}
