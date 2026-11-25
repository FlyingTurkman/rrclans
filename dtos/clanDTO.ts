import type { Clan, Region } from "@/types"









// Public data of a clan. Members are only counted, never copied.
export class ClanDto {
    id: string
    clanName: string
    clanTag: string
    clanHref: string
    region: Region
    memberCount: number
    createdAt: Date

    constructor(data: Clan & { _count: { members: number } }) {
        this.id = data.id
        this.clanName = data.clanName
        this.clanTag = data.clanTag
        this.clanHref = data.clanHref
        this.region = data.region
        this.memberCount = data._count.members
        this.createdAt = data.createdAt
    }
}
