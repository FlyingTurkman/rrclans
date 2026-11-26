import { ItemDto } from "@/dtos/itemDTO"
import { ServerDto } from "@/dtos/serverDTO"
import { PublicUserDto } from "@/dtos/userDTO"
import type { ClanInventoryItem, ClanMember, Item, Server, User } from "@/types"









type ClanInventoryItemSource = ClanInventoryItem & {
    member: ClanMember & { user: Omit<User, "password"> }
    server: Server
}

// Item a member has on a server, listed in the inventory of their clan.
export class ClanInventoryItemDto {
    id: string
    itemId: string
    // Null if the item no longer exists in lib/src/items.ts.
    item: ItemDto | null
    quantity: number
    player: PublicUserDto
    server: ServerDto
    // The logged-in user listed it.
    canRemove: boolean
    updatedAt: Date

    constructor(data: ClanInventoryItemSource, item: Item | undefined, flags: { canRemove: boolean }) {
        this.id = data.id
        this.itemId = data.itemId
        this.item = item ? { ...new ItemDto(item) } : null
        this.quantity = data.quantity
        this.player = { ...new PublicUserDto(data.member.user) }
        this.server = { ...new ServerDto(data.server) }
        this.canRemove = flags.canRemove
        this.updatedAt = data.updatedAt
    }
}
