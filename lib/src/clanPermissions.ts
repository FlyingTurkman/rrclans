import { clanRolePriorities, clanRoles } from "@/lib/src/clanRoles"
import type { ClanRole } from "@/types"

// Pure rank rules, shared by the server (which enforces them) and the panel
// (which hides what is not allowed). There is no leadership transfer: nobody
// can become or stop being the leader.

/** Leader and officers manage the clan. */
export function isManagerRole(role: ClanRole | null): boolean {
    return role !== null && clanRolePriorities[role] >= clanRolePriorities.OFFICER
}

/** Only the leader changes the avatar of the clan. */
export function canChangeAvatar(role: ClanRole | null): boolean {
    return role !== null && clanRolePriorities[role] >= clanRolePriorities.LEADER
}

/** Managers manage the members with a lower priority than their own. */
export function canManageRole(role: ClanRole | null, targetRole: ClanRole): boolean {
    return role !== null && isManagerRole(role) && clanRolePriorities[targetRole] < clanRolePriorities[role]
}

/** Ranks a member with `role` can give to others. */
export function getAssignableRoles(role: ClanRole | null): ClanRole[] {
    return clanRoles.filter((targetRole) => canManageRole(role, targetRole))
}
