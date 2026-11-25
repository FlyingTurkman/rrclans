"use server"

import { getTranslations } from "next-intl/server"
import { Prisma } from "@prisma/client"
import { UserDto } from "@/dtos/userDTO"
import { verifyPassword } from "@/lib/auth/password"
import { getSession } from "@/lib/auth/session"
import { prisma } from "@/lib/prisma"
import { createChangeEmailSchema, type ChangeEmailFormValues } from "@/lib/schemas/change-email.schema"
import { toFieldErrors } from "@/lib/validation"
import type { ActionResult } from "@/types"

/** Changes the email of the logged-in user. Needs the current password. */
export async function changeEmail(input: ChangeEmailFormValues): Promise<ActionResult<UserDto>> {
    const tv = await getTranslations("Validation")
    const te = await getTranslations("AuthErrors")

    const parsed = createChangeEmailSchema(tv).safeParse(input)

    if (!parsed.success) return { success: false, fieldErrors: toFieldErrors(parsed.error) }

    const { email, currentPassword } = parsed.data

    try {
        const session = await getSession()
        const current = session && await prisma.user.findUnique({ where: { id: session.userId }, select: { id: true, password: true } })

        if (!current) return { success: false, error: te("unauthorized") }

        if (!await verifyPassword(current.password, currentPassword)) {
            return { success: false, fieldErrors: { currentPassword: te("wrongPassword") } }
        }

        const user = await prisma.user.update({
            where: { id: current.id },
            data: { email },
            omit: { password: true },
        })

        return { success: true, data: { ...new UserDto(user) } }
    } catch (error) {
        // The email is the only unique field changed here.
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
            return { success: false, fieldErrors: { email: te("emailTaken") } }
        }

        console.error("changeEmail failed", error)

        return { success: false, error: te("unknown") }
    }
}
