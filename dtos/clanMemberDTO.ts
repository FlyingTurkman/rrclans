import { ClanDto } from "@/dtos/clanDTO"
import { PublicUserDto } from "@/dtos/userDTO"
import type { Clan, ClanMember, ClanRole, User } from "@/types"









// Nested DTOs are spread into plain objects: class instances cannot cross the
// server/client boundary.

// Member of a clan, seen from the clan page.
export class ClanMemberDto {
    id: string
    role: ClanRole
    createdAt: Date
    user: PublicUserDto

    constructor(data: ClanMember & { user: Omit<User, "password"> }) {
        this.id = data.id
        this.role = data.role
        this.createdAt = data.createdAt
        this.user = { ...new PublicUserDto(data.user) }
    }
}

// Clan of a player, seen from the player page.
export class PlayerClanDto {
    id: string
    role: ClanRole
    createdAt: Date
    clan: ClanDto

    constructor(data: ClanMember & { clan: Clan & { _count: { members: number } } }) {
        this.id = data.id
        this.role = data.role
        this.createdAt = data.createdAt
        this.clan = { ...new ClanDto(data.clan) }
    }
}
