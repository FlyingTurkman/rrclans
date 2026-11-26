import { ClanDto } from "@/dtos/clanDTO"
import { ServerDto } from "@/dtos/serverDTO"
import { PublicUserDto } from "@/dtos/userDTO"
import type { Clan, ClanRole, LfcListing, LfpListing, Region, Server, User } from "@/types"









// Nested DTOs are spread into plain objects: class instances cannot cross the
// server/client boundary.

// Rank of an LFP listing saved before ranks existed.
const DEFAULT_LFP_ROLE: ClanRole = "RECRUIT"

// Player who searches for a clan.
export class LfcListingDto {
    id: string
    region: Region
    message: string
    player: PublicUserDto
    // Chosen servers that are still active, newest first.
    servers: ServerDto[]
    updatedAt: Date

    constructor(data: LfcListing & { user: Omit<User, "password"> }, servers: Server[]) {
        this.id = data.id
        this.region = data.region
        this.message = data.message
        this.player = { ...new PublicUserDto(data.user) }
        this.servers = servers.map((server) => ({ ...new ServerDto(server) }))
        this.updatedAt = data.updatedAt
    }
}

// Clan that searches for players.
export class LfpListingDto {
    id: string
    message: string
    // Rank the clan is looking for.
    role: ClanRole
    clan: ClanDto
    // Chosen servers that are still active servers of the clan, newest first.
    servers: ServerDto[]
    updatedAt: Date

    constructor(data: LfpListing & { clan: Clan & { _count: { members: number } } }, servers: Server[]) {
        this.id = data.id
        this.message = data.message
        this.role = data.role ?? DEFAULT_LFP_ROLE
        this.clan = { ...new ClanDto(data.clan) }
        this.servers = servers.map((server) => ({ ...new ServerDto(server) }))
        this.updatedAt = data.updatedAt
    }
}
