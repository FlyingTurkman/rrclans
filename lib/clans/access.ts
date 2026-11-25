import "server-only"
import { getSession } from "@/lib/auth/session"
import { prisma } from "@/lib/prisma"

export type ClanAccess = {
    userId: string
    // Leader or officer of the clan: writes posts and manages servers.
    isManager: boolean
    // Site MOD or ADMIN: can delete posts of every clan.
    isModerator: boolean
}

/** What the logged-in user may do in a clan, or null for visitors. */
export async function getClanAccess(clanId: string): Promise<ClanAccess | null> {
    const session = await getSession()

    if (!session) return null

    const user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { id: true, role: true, clanMemberships: { where: { clanId }, select: { role: true } } },
    })

    if (!user) return null

    return {
        userId: user.id,
        isManager: user.clanMemberships.some(({ role }) => role === "LEADER" || role === "OFFICER"),
        isModerator: user.role === "MOD" || user.role === "ADMIN",
    }
}

/** Only the author edits a post, and only while still a manager of the clan. */
export function canEditPost(access: ClanAccess | null, authorId: string): boolean {
    return !!access && access.isManager && access.userId === authorId
}

/** Author, leader, officers and site moderators delete posts. */
export function canDeletePost(access: ClanAccess | null, authorId: string): boolean {
    return !!access && (access.isManager || access.isModerator || access.userId === authorId)
}
