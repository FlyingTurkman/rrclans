import { ClanDto } from "@/dtos/clanDTO"
import { ServerDto } from "@/dtos/serverDTO"
import { PublicUserDto } from "@/dtos/userDTO"
import type { Clan, ClanMember, ClanRole, Server, User } from "@/types"









// Nested DTOs are spread into plain objects: class instances cannot cross the
// server/client boundary.

// Member of a clan, seen from the clan page.
export class ClanMemberDto {
    id: string
    role: ClanRole
    createdAt: Date
    user: PublicUserDto
    // Active server of the member, null if there is none.
    server: ServerDto | null

    constructor(data: ClanMember & { user: Omit<User, "password"> & { servers: { server: Server }[] } }) {
        this.id = data.id
        this.role = data.role
        this.createdAt = data.createdAt
        this.user = { ...new PublicUserDto(data.user) }
        // The query selects only the active server.
        this.server = data.user.servers[0] ? { ...new ServerDto(data.user.servers[0].server) } : null
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
