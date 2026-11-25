import { z } from "zod"

// Schemas for auth values that come from cookies (not from forms),
// so they have no translated messages.

/** MongoDB ObjectId: 24 hex characters. */
export const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i)

/** Access/refresh token from a cookie: 64 random bytes as base64url (86 chars). */
export const authTokenSchema = z.string().regex(/^[\w-]{86}$/)

/**
 * Path to return to after login (`?next=`). Only paths on this site: rejects
 * absolute URLs, `//host`, backslashes and whitespace, which browsers may
 * resolve to another site.
 */
export const nextPathSchema = z.string().regex(/^\/(?!\/)[^\\\s]*$/)
