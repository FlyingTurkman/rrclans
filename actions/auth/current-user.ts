"use server"

import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth/session"
import { UserDto } from "@/dtos/userDTO"

/** Returns the logged-in user as a UserDto (masked email/password), or null. */
export async function getCurrentUser(): Promise<UserDto | null> {
    const session = await getSession()

    if (!session) return null

    const user = await prisma.user.findUnique({
        where: { id: session.userId },
        omit: { password: true },
    })

    if (!user) return null

    // Spread into a plain object: class instances cannot be sent from
    // server actions to client components.
    return { ...new UserDto(user) }
}
