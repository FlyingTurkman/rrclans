'use client'

import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import { useSearchQuery } from "use-search-query"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { itemRarities, itemRarityColors, type ItemRarity } from "@/lib/src/itemRarities"









// Select value for "no rarity filter".
const ALL_RARITIES = "all"

type ListRaritySelectProps = {
    // Rarity currently in the URL.
    rarity?: ItemRarity
}

// Item rarity filter of a list.
export default function ListRaritySelect({ rarity }: ListRaritySelectProps) {
    const t = useTranslations("ListFilters")
    const pathname = usePathname()
    const { routeToSearchParams } = useSearchQuery()

    const items = [
        { value: ALL_RARITIES, label: t("allRarities") },
        ...itemRarities.map((value) => ({ value, label: value })),
    ]

    return (
        <Select
        items={items}
        value={rarity ?? ALL_RARITIES}
        onValueChange={(newRarity) => {
            routeToSearchParams(pathname, { rarity: newRarity === ALL_RARITIES ? undefined : newRarity, page: undefined })
        }}
        >
            <SelectTrigger aria-label={t("rarityLabel")}>
                <SelectValue/>
            </SelectTrigger>
            <SelectContent>
                {items.map((option) => {

                    return (
                        <SelectItem
                        key={option.value}
                        value={option.value}
                        >
                            <span style={option.value === ALL_RARITIES ? undefined : { color: itemRarityColors[option.value as ItemRarity] }}>
                                {option.label}
                            </span>
                        </SelectItem>
                    )
                })}
            </SelectContent>
        </Select>
    )
}
