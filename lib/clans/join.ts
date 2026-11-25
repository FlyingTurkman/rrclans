import "server-only"
import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { getRoleData } from "@/lib/src/clanRoles"

/**
 * Makes a player a member (RECRUIT) and removes their pending request and
 * invite. `claim` runs in the same transaction and says whether the player may
 * join (e.g. it deletes the invite): two parallel calls cannot use one invite
 * twice. Returns false if `claim` refuses. Does not check permissions.
 */
export async function addClanMember(
    clanId: string,
    userId: string,
    claim: (tx: Prisma.TransactionClient) => Promise<boolean>,
): Promise<boolean> {
    try {
        return await prisma.$transaction(async (tx) => {
            if (!await claim(tx)) return false

            await tx.clanMember.create({ data: { clanId, userId, ...getRoleData("RECRUIT") } })
            await tx.clanJoinRequest.deleteMany({ where: { clanId, userId } })
            await tx.clanInvite.deleteMany({ where: { clanId, userId } })

            return true
        })
    } catch (error) {
        // Already a member: only the pending request and invite are left over.
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
            await prisma.clanJoinRequest.deleteMany({ where: { clanId, userId } })
            await prisma.clanInvite.deleteMany({ where: { clanId, userId } })

            return true
        }

        throw error
    }
}

/** Uses up the invite of a player. */
export async function claimInvite(tx: Prisma.TransactionClient, clanId: string, userId: string): Promise<boolean> {
    const { count } = await tx.clanInvite.deleteMany({ where: { clanId, userId } })

    return count > 0
}

/** Uses up the join request of a player. */
export async function claimRequest(tx: Prisma.TransactionClient, clanId: string, userId: string): Promise<boolean> {
    const { count } = await tx.clanJoinRequest.deleteMany({ where: { clanId, userId } })

    return count > 0
}
