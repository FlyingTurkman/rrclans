// Rarities of ROB RUN items, lowest to highest, with their color on MetaForge.
// Common and Legendary are not confirmed colors.
export const itemRarities = ["Common", "Uncommon", "Epic", "Legendary", "Exotic"] as const

export type ItemRarity = (typeof itemRarities)[number]

export const itemRarityColors: Record<ItemRarity, string> = {
    Common: "#B5B5B5",
    Uncommon: "#67F835",
    Epic: "#E375FF",
    Legendary: "#FFB13B",
    Exotic: "#E83030",
}
