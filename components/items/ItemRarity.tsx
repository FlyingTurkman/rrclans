import type { ItemDto } from "@/dtos/itemDTO"
import { itemRarityColors } from "@/lib/src/itemRarities"









type ItemRarityProps = {
    item: ItemDto
}

// Rarity, level or category and detail of an item, e.g. "Epic · Level 2 · Full".
export default function ItemRarity({ item }: ItemRarityProps) {
    const kind = item.level !== null ? `Level ${item.level}` : item.category
    const parts = [kind, item.detail].filter(Boolean)

    return (
        <span className="text-sm text-muted-foreground">
            {item.rarity && <span style={{ color: itemRarityColors[item.rarity] }}>{item.rarity}</span>}
            {item.rarity && parts.length > 0 && " · "}
            {parts.join(" · ")}
        </span>
    )
}
