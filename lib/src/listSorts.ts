// Sort options of the filtered lists, the first one is the default.
export const listSorts = ["newest", "oldest", "name"] as const

export type ListSort = (typeof listSorts)[number]

export const defaultListSort: ListSort = listSorts[0]

// Sort options of clan members, the first one is the default.
export const memberSorts = ["rank", ...listSorts] as const

export type MemberSort = (typeof memberSorts)[number]

export const defaultMemberSort: MemberSort = memberSorts[0]
