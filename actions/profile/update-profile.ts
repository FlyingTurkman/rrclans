"use server"

import { getTranslations } from "next-intl/server"
import { Prisma } from "@prisma/client"
import { UserDto } from "@/dtos/userDTO"
import { getSession } from "@/lib/auth/session"
import { prisma } from "@/lib/prisma"
import { createProfileSchema, type ProfileFormValues } from "@/lib/schemas/profile.schema"
import { toFieldErrors } from "@/lib/validation"
import type { ActionResult } from "@/types"

/** Changes the username and name of the logged-in user. */
export async function updateProfile(input: ProfileFormValues): Promise<ActionResult<UserDto>> {
    const tv = await getTranslations("Validation")
    const te = await getTranslations("AuthErrors")

    const parsed = createProfileSchema(tv).safeParse(input)

    if (!parsed.success) return { success: false, fieldErrors: toFieldErrors(parsed.error) }

    const { username, name, surname } = parsed.data

    try {
        const session = await getSession()

        if (!session) return { success: false, error: te("unauthorized") }

        const user = await prisma.user.update({
            where: { id: session.userId },
            data: { username, name, surname, fullname: `${name} ${surname}` },
            omit: { password: true },
        })

        return { success: true, data: { ...new UserDto(user) } }
    } catch (error) {
        // The username is the only unique field changed here.
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
            return { success: false, fieldErrors: { username: te("usernameTaken") } }
        }

        console.error("updateProfile failed", error)

        return { success: false, error: te("unknown") }
    }
}
