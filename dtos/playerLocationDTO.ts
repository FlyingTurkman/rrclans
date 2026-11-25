import type { UserServer } from "@/types"









// Location of a player on one server, null values if not set yet.
export class PlayerLocationDto {
    district: string | null
    settlement: number | null

    constructor(data: Pick<UserServer, "district" | "settlement">) {
        this.district = data.district ?? null
        this.settlement = data.settlement ?? null
    }
}
