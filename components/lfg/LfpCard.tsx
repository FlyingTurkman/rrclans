'use client'

import Link from "next/link"
import { useFormatter, useTranslations } from "next-intl"
import LfgServers from "@/components/lfg/LfgServers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { LfpListingDto } from "@/dtos/lfgDTO"









type LfpCardProps = {
    listing: LfpListingDto
}

// Clan that searches for players, links to the clan page.
export default function LfpCard({ listing }: LfpCardProps) {
    const t = useTranslations("Lfg")
    const tc = useTranslations("ClansPage")
    const tl = useTranslations("ListFilters")
    const format = useFormatter()

    return (
        <Link
        href={`/c/${listing.clan.id}`}
        className="block h-full rounded-xl"
        >
            <Card className="h-full transition-colors hover:bg-accent">
                <CardHeader>
                    <CardTitle>[{listing.clan.clanTag}] {listing.clan.clanName}</CardTitle>
                    <CardDescription>
                        {tl(`regions.${listing.clan.region}`)} · {tc("members", { count: listing.clan.memberCount })} · {t("updated", { date: format.dateTime(listing.updatedAt, { dateStyle: "medium" }) })}
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col justify-between gap-3">
                    <p className="break-words whitespace-pre-wrap">{listing.message}</p>
                    <LfgServers servers={listing.servers}/>
                </CardContent>
            </Card>
        </Link>
    )
}
