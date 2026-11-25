'use client'

import Link from "next/link"
import { useTranslations } from "next-intl"
import ClanAvatar from "@/components/clans/ClanAvatar"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import type { ClanDto } from "@/dtos/clanDTO"
import type { ClanRole } from "@/types"









type ClanCardProps = {
    clan: ClanDto
    // Rank of a player in this clan (player page).
    role?: ClanRole
}

// Clan summary, links to the clan page.
export default function ClanCard({ clan, role }: ClanCardProps) {
    const t = useTranslations("ClansPage")
    const tl = useTranslations("ListFilters")
    const tr = useTranslations("ClanRoles")

    return (
        <Link
        href={`/c/${clan.id}`}
        className="block rounded-xl"
        >
            <Card className="transition-colors hover:bg-accent">
                <CardContent className="flex items-center gap-4">
                    <ClanAvatar
                    clanName={clan.clanName}
                    avatar={clan.avatar}
                    size="lg"
                    className="size-16 data-[size=lg]:size-16 *:text-2xl"
                    />
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <CardTitle className="truncate">[{clan.clanTag}] {clan.clanName}</CardTitle>
                        <CardDescription>{tl(`regions.${clan.region}`)}</CardDescription>
                        <p>{t("members", { count: clan.memberCount })}</p>
                    </div>
                    {role && <span className="font-medium text-primary">{tr(role)}</span>}
                </CardContent>
            </Card>
        </Link>
    )
}
