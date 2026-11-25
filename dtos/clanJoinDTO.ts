import { ClanDto } from "@/dtos/clanDTO"
import { PublicUserDto } from "@/dtos/userDTO"
import type { Clan, User } from "@/types"









type JoinRecord = {
    id: string
    createdAt: Date
}

// Nested DTOs are spread into plain objects: class instances cannot cross the
// server/client boundary.

// Join request or invite, seen from the clan panel.
export class ClanJoinDto {
    id: string
    createdAt: Date
    user: PublicUserDto

    constructor(data: JoinRecord & { user: Omit<User, "password"> }) {
        this.id = data.id
        this.createdAt = data.createdAt
        this.user = { ...new PublicUserDto(data.user) }
    }
}

// Invite, seen from the profile of the invited player.
export class ProfileInviteDto {
    id: string
    createdAt: Date
    clan: ClanDto

    constructor(data: JoinRecord & { clan: Clan & { _count: { members: number } } }) {
        this.id = data.id
        this.createdAt = data.createdAt
        this.clan = { ...new ClanDto(data.clan) }
    }
}
