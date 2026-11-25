import "server-only"
import { argon2id, hash, needsRehash, verify, type HashOptions } from "argon2"

// argon2id with the OWASP recommended minimum settings
// (19 MiB memory, 2 iterations, 1 degree of parallelism).
const HASH_OPTIONS = {
    type: argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
} satisfies HashOptions

/** Hashes a plain password. Store only the returned hash. */
export async function hashPassword(password: string): Promise<string> {
    return hash(password, HASH_OPTIONS)
}

/**
 * Checks a plain password against a stored hash.
 * Returns false (instead of throwing) for malformed hashes.
 */
export async function verifyPassword(storedHash: string, password: string): Promise<boolean> {
    try {
        return await verify(storedHash, password)
    } catch {
        return false
    }
}

/**
 * True when a stored hash was made with older settings and should be
 * re-hashed after a successful login.
 */
export function passwordNeedsRehash(storedHash: string): boolean {
    return needsRehash(storedHash, HASH_OPTIONS)
}
