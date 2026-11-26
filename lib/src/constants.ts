import type { District } from "@/types"














export const pageLimit = 50

// Newest clans, servers and listings on the home page.
export const homePreviewLimit = 6

// Results per group (clans, players) in the main menu search bar.
export const searchLimit = 5

// Lifetime of a game server in days, counted from its `beganAt`.
export const serverLifetimeDays = 7

// Maximum number of characters in a clan post.
export const postMaxLength = 10000

// Highest quantity of one item in a clan inventory.
export const inventoryMaxQuantity = 9999

// Most servers one LFC or LFP listing can be for.
export const lfgMaxServers = 10

// Maximum number of characters in an LFC or LFP listing.
export const listingMaxLength = 500

// Notifications in the main menu.
export const notificationMenuLimit = 10

// Districts of the game, their level is 1, 2 or 3.
export const districts: District[] = [
    { name: "Rustvale", level: 1 },
    { name: "Fairfield", level: 1 },
    { name: "Dustbowl", level: 1 },
    { name: "Redstone", level: 1 },
    { name: "Loneford", level: 1 },
    { name: "Cascadas", level: 1 },
    { name: "Fallrock", level: 2 },
    { name: "Rivertown", level: 2 },
    { name: "El Peso", level: 2 },
    { name: "Highlands", level: 3 },
]

// Settlements in every district, numbered from 1.
export const settlementCount = 51
