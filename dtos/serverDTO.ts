import { getServerEndsAt } from "@/lib/src/serverLifetime"
import type { Server } from "@/types"









// Public data of a game server.
export class ServerDto {
    id: string
    serverName: string
    beganAt: Date
    endsAt: Date

    constructor(data: Server) {
        this.id = data.id
        this.serverName = data.serverName
        this.beganAt = data.beganAt
        this.endsAt = getServerEndsAt(data.beganAt)
    }
}
