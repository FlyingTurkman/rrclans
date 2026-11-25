import "server-only"
import { getSession } from "@/lib/auth/session"
import { prisma } from "@/lib/prisma"
import { canManageRole, isManagerRole } from "@/lib/src/clanPermissions"
import type { ClanJoinStatus, ClanRole } from "@/types"

export type ClanAccess = {
    userId: string
    // Rank in the clan, null if not a member.
    role: ClanRole | null
    // Any rank in the clan: sees MEMBER posts.
    isMember: boolean
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
        role: user.clanMemberships[0]?.role ?? null,
        isMember: user.clanMemberships.length > 0,
        isManager: isManagerRole(user.clanMemberships[0]?.role ?? null),
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

/** Change the rank of a member or remove them. Nobody manages themselves. */
export function canManageMember(access: ClanAccess | null, member: { userId: string, role: ClanRole }): boolean {
    return !!access && access.userId !== member.userId && canManageRole(access.role, member.role)
}

/** Is the logged-in user a member, invited or waiting for an answer? */
export async function getJoinStatus(access: ClanAccess | null, clanId: string): Promise<ClanJoinStatus> {
    if (!access) return "NONE"
    if (access.isMember) return "MEMBER"

    const where = { clanId_userId: { clanId, userId: access.userId } }

    const [invite, request] = await Promise.all([
        prisma.clanInvite.findUnique({ where, select: { id: true } }),
        prisma.clanJoinRequest.findUnique({ where, select: { id: true } }),
    ])

    if (invite) return "INVITED"

    return request ? "REQUESTED" : "NONE"
}
