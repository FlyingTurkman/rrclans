"use server"

import { headers } from "next/headers"
import { getTranslations } from "next-intl/server"
import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/auth/password"
import { startSession } from "@/lib/auth/session"
import { UserDto } from "@/dtos/userDTO"
import { createRegisterSchema, type RegisterFormValues } from "@/lib/schemas/register.schema"
import { toFieldErrors } from "@/lib/validation"
import type { ActionResult } from "@/types"

/** Creates a new account and logs the user in. */
export async function register(input: RegisterFormValues): Promise<ActionResult<UserDto>> {
    const tv = await getTranslations("Validation")
    const te = await getTranslations("AuthErrors")

    const parsed = createRegisterSchema(tv).safeParse(input)

    if (!parsed.success) {
        return { success: false, fieldErrors: toFieldErrors(parsed.error) }
    }

    const { username, name, surname, email, password } = parsed.data

    try {
        // Check both fields up front so the form can show every conflict at once.
        const [usernameTaken, emailTaken] = await Promise.all([
            prisma.user.findUnique({ where: { username }, select: { id: true } }),
            prisma.user.findUnique({ where: { email }, select: { id: true } }),
        ])

        if (usernameTaken || emailTaken) {
            const fieldErrors: Record<string, string> = {}

            if (usernameTaken) fieldErrors.username = te("usernameTaken")
            if (emailTaken) fieldErrors.email = te("emailTaken")

            return { success: false, fieldErrors }
        }

        const user = await prisma.user.create({
            data: {
                username,
                name,
                surname,
                fullname: `${name} ${surname}`,
                email,
                password: await hashPassword(password),
            },
            omit: { password: true },
        })

        await startSession({ userId: user.id, username: user.username }, (await headers()).get("user-agent"))

        return { success: true, data: { ...new UserDto(user) } }
    } catch (error) {
        // Unique index hit by a concurrent request. `target` names the index
        // ("User_email_key") or its fields, depending on the database.
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
            const target = JSON.stringify(error.meta?.target ?? "")

            if (target.includes("email")) return { success: false, fieldErrors: { email: te("emailTaken") } }
            if (target.includes("username")) return { success: false, fieldErrors: { username: te("usernameTaken") } }
        }

        console.error("register failed", error)

        return { success: false, error: te("unknown") }
    }
}
