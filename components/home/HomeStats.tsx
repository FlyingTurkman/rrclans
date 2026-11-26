'use client'

import Link from "next/link"
import { useFormatter, useTranslations } from "next-intl"
import type { HomeDashboard } from "@/types"









type HomeStatsProps = {
    stats: HomeDashboard["stats"]
}

// Numbers of the site, each links to its page.
export default function HomeStats({ stats }: HomeStatsProps) {
    const t = useTranslations("HomePage")
    const format = useFormatter()

    const tiles = [
        { label: t("stats.clans"), value: stats.clanCount, href: "/clans" },
        { label: t("stats.players"), value: stats.playerCount, href: "/players" },
        { label: t("stats.servers"), value: stats.activeServerCount, href: "/clans" },
        { label: t("stats.lfc"), value: stats.lfcCount, href: "/lfc" },
        { label: t("stats.lfp"), value: stats.lfpCount, href: "/lfp" },
    ]

    return (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {tiles.map((tile) => {

                return (
                    <li key={tile.label}>
                        <Link
                        href={tile.href}
                        className="flex h-full flex-col gap-1 rounded-xl border bg-card p-4 transition-colors hover:bg-accent"
                        >
                            <span className="font-heading text-3xl font-extrabold tabular-nums">{format.number(tile.value)}</span>
                            <span className="text-sm text-muted-foreground">{tile.label}</span>
                        </Link>
                    </li>
                )
            })}
        </ul>
    )
}
