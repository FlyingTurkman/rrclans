import type { PostVisibility } from "@/types"

// Who can see a clan post, the first one is the default.
export const postVisibilities = ["PUBLIC", "MEMBER"] as const satisfies readonly PostVisibility[]
