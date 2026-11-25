'use client'

import Link from "next/link"
import { useFormatter, useTranslations } from "next-intl"
import LfgServers from "@/components/lfg/LfgServers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import UserAvatar from "@/components/user/UserAvatar"
import type { LfcListingDto } from "@/dtos/lfgDTO"









type LfcCardProps = {
    listing: LfcListingDto
}

// Player who searches for a clan, links to the player page.
export default function LfcCard({ listing }: LfcCardProps) {
    const t = useTranslations("Lfg")
    const tl = useTranslations("ListFilters")
    const format = useFormatter()

    return (
        <Link
        href={`/p/${listing.player.id}`}
        className="block h-full rounded-xl"
        >
            <Card className="h-full transition-colors hover:bg-accent">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UserAvatar
                        username={listing.player.username}
                        avatar={listing.player.avatar}
                        size="sm"
                        />
                        <span className="truncate">{listing.player.username}</span>
                    </CardTitle>
                    <CardDescription>
                        {tl(`regions.${listing.region}`)} · {t("updated", { date: format.dateTime(listing.updatedAt, { dateStyle: "medium" }) })}
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col justify-between gap-3">
                    <p className="break-words whitespace-pre-wrap">{listing.message}</p>
                    <LfgServers servers={listing.server ? [listing.server] : []}/>
                </CardContent>
            </Card>
        </Link>
    )
}
