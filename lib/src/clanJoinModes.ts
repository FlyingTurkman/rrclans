import type { ClanJoinMode } from "@/types"

// How players join a clan: only by invite, by a request the leader or an
// officer accepts, or open to everyone.
export const clanJoinModes = ["INVITE", "REQUEST", "OPEN"] as const satisfies readonly ClanJoinMode[]
