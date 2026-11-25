import { ClanDto } from "@/dtos/clanDTO"
import { ServerDto } from "@/dtos/serverDTO"
import { PublicUserDto } from "@/dtos/userDTO"
import type { Clan, LfcListing, LfpListing, Region, Server, User } from "@/types"









// Nested DTOs are spread into plain objects: class instances cannot cross the
// server/client boundary.

// Player who searches for a clan.
export class LfcListingDto {
    id: string
    region: Region
    message: string
    player: PublicUserDto
    // Active server of the player, null if there is none.
    server: ServerDto | null
    updatedAt: Date

    constructor(data: LfcListing & { user: Omit<User, "password"> & { servers: { server: Server }[] } }) {
        // The query selects only the active server.
        const server = data.user.servers[0]?.server

        this.id = data.id
        this.region = data.region
        this.message = data.message
        this.player = { ...new PublicUserDto(data.user) }
        this.server = server ? { ...new ServerDto(server) } : null
        this.updatedAt = data.updatedAt
    }
}

// Clan that searches for players.
export class LfpListingDto {
    id: string
    message: string
    clan: ClanDto
    servers: ServerDto[]
    updatedAt: Date

    constructor(data: LfpListing & { clan: Clan & { _count: { members: number }, servers: { server: Server }[] } }) {
        this.id = data.id
        this.message = data.message
        this.clan = { ...new ClanDto(data.clan) }
        this.servers = data.clan.servers.map(({ server }) => ({ ...new ServerDto(server) }))
        this.updatedAt = data.updatedAt
    }
}
