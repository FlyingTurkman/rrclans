import "server-only"
import type { TokenRevokeReason } from "@prisma/client"
import { createHash, randomBytes } from "node:crypto"
import { prisma } from "@/lib/prisma"
import { authTokenSchema } from "@/lib/schemas/auth.schema"
import type { AccessTokenPayload } from "@/types"
import { ACCESS_TOKEN_TTL, AUTH_TOKEN_BYTES, REFRESH_TOKEN_REUSE_GRACE, REFRESH_TOKEN_TTL } from "./config"

// Both tokens are long random strings (no JWT). The client keeps the raw
// token in an httpOnly cookie, the database stores only its SHA-256 hash,
// so a database leak does not expose usable tokens.

/** 64 cryptographically random bytes as base64url (86 characters). */
function generateToken(): string {
    return randomBytes(AUTH_TOKEN_BYTES).toString("base64url")
}

function hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex")
}

function isWellFormed(token: string): boolean {
    return authTokenSchema.safeParse(token).success
}

// "Not revoked" filter. On MongoDB an optional field that was never written is
// missing, and `revokedAt: null` alone does not match missing fields.
const notRevoked = {
    OR: [{ revokedAt: null }, { revokedAt: { isSet: false } }],
}

// ---------------------------------------------------------------------------
// Access token (short-lived, checked against the database on every request)
// ---------------------------------------------------------------------------

/** Creates an access token for a session. Returns the raw token. */
export async function createAccessToken(userId: string, refreshTokenId: string): Promise<string> {
    const token = generateToken()

    await prisma.accessToken.create({
        data: {
            tokenHash: hashToken(token),
            userId,
            refreshTokenId,
            expiresAt: new Date(Date.now() + ACCESS_TOKEN_TTL * 1000),
        },
    })

    return token
}

/** Looks up an access token. Returns null if it is unknown or expired. */
export async function verifyAccessToken(token: string): Promise<AccessTokenPayload | null> {
    // Malformed cookie values never reach the database.
    if (!isWellFormed(token)) return null

    const record = await prisma.accessToken.findUnique({
        where: { tokenHash: hashToken(token) },
        select: { expiresAt: true, user: { select: { id: true, username: true } } },
    })

    if (!record || record.expiresAt <= new Date()) return null

    return { userId: record.user.id, username: record.user.username }
}

// ---------------------------------------------------------------------------
// Refresh token (long-lived, rotated on every use)
// ---------------------------------------------------------------------------

/** Creates a refresh token (a new session). Returns the raw token and its id. */
export async function createRefreshToken(userId: string, userAgent?: string | null) {
    const token = generateToken()
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL * 1000)

    const record = await prisma.refreshToken.create({
        data: {
            tokenHash: hashToken(token),
            userId,
            expiresAt,
            userAgent: userAgent ?? null,
            revokedAt: null,
        },
    })

    return { token, id: record.id, expiresAt }
}

/** Creates a refresh token and its first access token (login / register / rotation). */
export async function createSessionTokens(userId: string, userAgent?: string | null) {
    const refresh = await createRefreshToken(userId, userAgent)
    const accessToken = await createAccessToken(userId, refresh.id)

    return { accessToken, refreshToken: refresh.token, refreshTokenId: refresh.id }
}

/** Result of rotateRefreshToken. */
export type RefreshRotation =
    // New tokens were issued.
    | { status: "rotated", user: AccessTokenPayload, accessToken: string, refreshToken: string }
    // Another request rotated this token a moment ago. Its response carries
    // the new cookies, so this request should not issue any.
    | { status: "concurrent", user: AccessTokenPayload }
    // Unknown, expired or reused token: the user must log in again.
    | { status: "invalid" }

/**
 * Exchanges a refresh token for a new refresh + access token (rotation).
 * If an already revoked token is used again after the grace period
 * (possible theft), every session of that user is revoked.
 */
export async function rotateRefreshToken(token: string, userAgent?: string | null): Promise<RefreshRotation> {
    if (!isWellFormed(token)) return { status: "invalid" }

    const existing = await prisma.refreshToken.findUnique({
        where: { tokenHash: hashToken(token) },
        include: { user: { select: { id: true, username: true } } },
    })

    if (!existing || existing.expiresAt <= new Date()) return { status: "invalid" }

    const user = { userId: existing.user.id, username: existing.user.username }

    // Atomically mark the token as used. If nothing was updated it was
    // already revoked by an earlier (or concurrent) request.
    const claimed = await prisma.refreshToken.updateMany({
        where: { id: existing.id, ...notRevoked },
        data: { revokedAt: new Date(), revokedReason: "ROTATED" },
    })

    if (claimed.count === 0) {
        const revoked = await prisma.refreshToken.findUnique({
            where: { id: existing.id },
            select: { revokedAt: true, revokedReason: true },
        })

        // Only a token that was just rotated by another request is tolerated.
        // Tokens revoked by logout or theft detection are rejected at once.
        const isRecentRotation = revoked?.revokedReason === "ROTATED"
            && !!revoked.revokedAt
            && Date.now() - revoked.revokedAt.getTime() < REFRESH_TOKEN_REUSE_GRACE * 1000

        if (isRecentRotation) return { status: "concurrent", user }

        // A rotated token used again later, or a logged-out token: possible
        // theft, so every session of the user is revoked.
        if (revoked?.revokedReason === "ROTATED") {
            await revokeAllRefreshTokens(existing.userId, "REUSE_DETECTED")
        }

        return { status: "invalid" }
    }

    const next = await createSessionTokens(existing.userId, userAgent)

    await prisma.refreshToken.update({
        where: { id: existing.id },
        data: { replacedById: next.refreshTokenId },
    })

    // Access tokens of the old refresh token are no longer needed.
    await prisma.accessToken.deleteMany({ where: { refreshTokenId: existing.id } })

    return { status: "rotated", user, accessToken: next.accessToken, refreshToken: next.refreshToken }
}

/** Logs out one session: revokes the refresh token and deletes its access tokens. */
export async function revokeRefreshToken(token: string): Promise<void> {
    if (!isWellFormed(token)) return

    const record = await prisma.refreshToken.findUnique({
        where: { tokenHash: hashToken(token) },
        select: { id: true },
    })

    if (!record) return

    await prisma.refreshToken.updateMany({
        where: { id: record.id, ...notRevoked },
        data: { revokedAt: new Date(), revokedReason: "LOGOUT" },
    })

    await prisma.accessToken.deleteMany({ where: { refreshTokenId: record.id } })
}

/** Logs out every session of a user. Access tokens stop working immediately. */
export async function revokeAllRefreshTokens(userId: string, reason: TokenRevokeReason = "LOGOUT"): Promise<void> {
    await prisma.refreshToken.updateMany({
        where: { userId, ...notRevoked },
        data: { revokedAt: new Date(), revokedReason: reason },
    })

    await prisma.accessToken.deleteMany({ where: { userId } })
}

/** Deletes expired access and refresh tokens. Run periodically (e.g. a cron job). */
export async function deleteExpiredTokens(): Promise<number> {
    const now = new Date()

    const access = await prisma.accessToken.deleteMany({ where: { expiresAt: { lte: now } } })
    const refresh = await prisma.refreshToken.deleteMany({ where: { expiresAt: { lte: now } } })

    return access.count + refresh.count
}
