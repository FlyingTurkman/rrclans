'use client'

import Link from "next/link"
import { useTranslations } from "next-intl"
import { Card, CardContent } from "@/components/ui/card"
import UserAvatar from "@/components/user/UserAvatar"
import type { PublicUserDto } from "@/dtos/userDTO"
import type { ClanRole } from "@/types"









type PlayerCardProps = {
    player: PublicUserDto
    // Rank of the player in a clan (clan page).
    role?: ClanRole
}

// Player summary, links to the player page.
export default function PlayerCard({ player, role }: PlayerCardProps) {
    const t = useTranslations("PlayersPage")
    const tr = useTranslations("ClanRoles")

    return (
        <Link
        href={`/p/${player.id}`}
        className="block rounded-xl"
        >
            <Card className="transition-colors hover:bg-accent">
                <CardContent className="flex items-center gap-3">
                    <UserAvatar
                    username={player.username}
                    avatar={player.avatar}
                    size="lg"
                    />
                    <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{player.username}</p>
                        {player.steamUsername && (
                            <p className="truncate text-muted-foreground">
                                {t("steam", { name: player.steamUsername })}
                            </p>
                        )}
                    </div>
                    {role && <span className="font-medium text-primary">{tr(role)}</span>}
                </CardContent>
            </Card>
        </Link>
    )
}
