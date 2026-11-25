import { serverLifetimeDays } from "@/lib/src/constants"

const LIFETIME_MS = serverLifetimeDays * 24 * 60 * 60 * 1000

/** Moment a server closes. */
export function getServerEndsAt(beganAt: Date): Date {
    return new Date(beganAt.getTime() + LIFETIME_MS)
}

/** A server is active from `beganAt` until the end of its lifetime. */
export function isServerActive(beganAt: Date, now = new Date()): boolean {
    return beganAt <= now && now < getServerEndsAt(beganAt)
}

/** `beganAt` filter of active servers, the same rule as isServerActive. */
export function getActiveServerRange(now = new Date()) {
    return { lte: now, gt: new Date(now.getTime() - LIFETIME_MS) }
}
