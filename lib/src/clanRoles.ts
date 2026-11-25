import type { ClanRole } from "@/types"

// Priority of each rank, higher is more powerful. It is also saved in
// `ClanMember.priority`, because MongoDB sorts the names of the ranks
// alphabetically: after changing a number, update the saved ones too.
export const clanRolePriorities = {
    LEADER: 4,
    OFFICER: 3,
    FIGHTER: 2,
    RECRUIT: 1,
} as const satisfies Record<ClanRole, number>

// Clan ranks, highest to lowest.
export const clanRoles = ["LEADER", "OFFICER", "FIGHTER", "RECRUIT"] as const satisfies readonly ClanRole[]

/** Data of a ClanMember with this rank. Never write `role` without `priority`. */
export function getRoleData<T extends ClanRole>(role: T) {
    return { role, priority: clanRolePriorities[role] }
}
