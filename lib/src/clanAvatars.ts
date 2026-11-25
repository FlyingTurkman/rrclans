// Ready-made clan avatars, there are no uploads. Each one is an image in
// public/clan-avatars (256x256, <id>.webp). The id is saved in `Clan.avatar`, so
// never rename or remove one that clans may use.
export const clanAvatars = [
    "skull-red",
    "skull-green",
    "skull-purple",
    "skull-blue",
    "demon-red",
    "demon-green",
    "demon-purple",
    "demon-blue",
    "eagle-red",
    "eagle-green",
    "eagle-purple",
    "eagle-blue",
    "bullets-red",
    "bullets-green",
    "bullets-purple",
    "bullets-blue",
] as const

export type ClanAvatarId = (typeof clanAvatars)[number]

/** Path of the image of an avatar, null without an avatar or if it is unknown. */
export function getClanAvatarSrc(avatar: string | null | undefined): string | null {
    const id = clanAvatars.find((value) => value === avatar)

    return id ? `/clan-avatars/${id}.webp` : null
}
