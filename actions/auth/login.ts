"use server"

import { headers } from "next/headers"
import { getTranslations } from "next-intl/server"
import { prisma } from "@/lib/prisma"
import { hashPassword, passwordNeedsRehash, verifyPassword } from "@/lib/auth/password"
import { startSession } from "@/lib/auth/session"
import { UserDto } from "@/dtos/userDTO"
import { createLoginSchema, type LoginFormValues } from "@/lib/schemas/login.schema"
import { toFieldErrors } from "@/lib/validation"
import type { ActionResult } from "@/types"

// Hash used when the email does not exist, so a missing account takes as long
// to reject as a wrong password (prevents finding registered emails by timing).
let dummyHash: Promise<string> | undefined

function getDummyHash() {
    dummyHash ??= hashPassword("dummy-password-for-timing")

    return dummyHash
}

/** Logs a user in with email + password. */
export async function login(input: LoginFormValues): Promise<ActionResult<UserDto>> {
    const tv = await getTranslations("Validation")
    const te = await getTranslations("AuthErrors")

    const parsed = createLoginSchema(tv).safeParse(input)

    if (!parsed.success) {
        return { success: false, fieldErrors: toFieldErrors(parsed.error) }
    }

    const { email, password } = parsed.data

    try {
        const user = await prisma.user.findUnique({ where: { email } })

        const valid = await verifyPassword(user?.password ?? (await getDummyHash()), password)

        // Same message for unknown email and wrong password.
        if (!user || !valid) {
            return { success: false, error: te("invalidCredentials") }
        }

        // Upgrade hashes created with older argon2 settings.
        if (passwordNeedsRehash(user.password)) {
            await prisma.user.update({
                where: { id: user.id },
                data: { password: await hashPassword(password) },
            })
        }

        await startSession({ userId: user.id, username: user.username }, (await headers()).get("user-agent"))

        return { success: true, data: { ...new UserDto(user) } }
    } catch (error) {
        console.error("login failed", error)

        return { success: false, error: te("unknown") }
    }
}
