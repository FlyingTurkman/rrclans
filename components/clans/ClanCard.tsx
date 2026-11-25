'use client'

import Link from "next/link"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
                <CardHeader>
                    <CardTitle>[{clan.clanTag}] {clan.clanName}</CardTitle>
                    <CardDescription>{tl(`regions.${clan.region}`)}</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-between gap-2">
                    <span>{t("members", { count: clan.memberCount })}</span>
                    {role && <span className="font-medium text-primary">{tr(role)}</span>}
                </CardContent>
            </Card>
        </Link>
    )
}
