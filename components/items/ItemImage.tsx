import Image from "next/image"
import { cn } from "cn"
import type { ItemDto } from "@/dtos/itemDTO"
import { itemRarityColors } from "@/lib/src/itemRarities"









type ItemImageProps = {
    item: ItemDto
    className?: string
}

// Image of an item on a background in the color of its rarity.
export default function ItemImage({ item, className }: ItemImageProps) {
    const color = item.rarity ? itemRarityColors[item.rarity] : "transparent"

    return (
        <span
        className={cn("relative block size-10 shrink-0 overflow-hidden rounded-md bg-muted", className)}
        style={{ backgroundImage: `linear-gradient(to bottom, transparent, color-mix(in srgb, ${color} 45%, transparent))` }}
        >
            {item.image && (
                <Image
                src={item.image}
                alt=""
                fill
                sizes="64px"
                className="object-contain p-0.5"
                />
            )}
        </span>
    )
}
