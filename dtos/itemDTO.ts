import type { Item, ItemRarity } from "@/types"









// A ROB RUN item from lib/src/items.ts.
export class ItemDto {
    id: string
    name: string
    rarity: ItemRarity | null
    category: string | null
    level: number | null
    detail: string | null
    price: number | null
    description: string | null
    image: string | null

    constructor(data: Item) {
        this.id = data.id
        this.name = data.name
        this.rarity = data.rarity ?? null
        this.category = data.category ?? null
        this.level = data.level ?? null
        this.detail = data.detail ?? null
        this.price = data.price ?? null
        this.description = data.description ?? null
        this.image = data.image ?? null
    }
}
