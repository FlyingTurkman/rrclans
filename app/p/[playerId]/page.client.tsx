'use client'

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useFormatter, useTranslations } from "next-intl"
import { getPlayer } from "@/actions/players/get-player"
import ClanCard from "@/components/clans/ClanCard"
import ServerHistory from "@/components/players/ServerHistory"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import UserAvatar from "@/components/user/UserAvatar"
import type { ActionResult, PlayerDetail } from "@/types"









// Result of the last request and the player it belongs to.
type LoadedPlayer = {
    playerId: string
    result: ActionResult<PlayerDetail>
}

export default function PlayerIdPageClient() {
    const t = useTranslations("PlayerPage")
    const tp = useTranslations("PlayersPage")
    const format = useFormatter()
    const { playerId } = useParams<{ playerId: string }>()

    const [loaded, setLoaded] = useState<LoadedPlayer | null>(null)

    useEffect(() => {
        let cancelled = false

        getPlayer(playerId)
            .catch((): ActionResult<PlayerDetail> => ({ success: false }))
            .then((result) => {
                if (!cancelled) setLoaded({ playerId, result })
            })

        return () => {
            cancelled = true
        }
    }, [playerId])

    const result = loaded?.playerId === playerId ? loaded.result : null

    return (
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8">
            {!result && (
                <div className="flex justify-center py-10">
                    <Spinner className="size-6" aria-label={t("loading")}/>
                </div>
            )}

            {result && !result.success && (
                <p className="text-destructive">{result.error ?? t("loadError")}</p>
            )}

            {result?.success && (
                <>
                    <div className="flex items-center gap-4">
                        <UserAvatar
                        username={result.data.player.username}
                        avatar={result.data.player.avatar}
                        size="lg"
                        className="size-20 data-[size=lg]:size-20 *:text-3xl"
                        />
                        <div className="min-w-0">
                            <h1 className="truncate font-heading text-3xl font-extrabold italic font-stretch-condensed">
                                {result.data.player.username}
                            </h1>
                            <p className="truncate">{result.data.player.fullname}</p>
                            {result.data.player.steamUsername && (
                                <p className="truncate text-muted-foreground">
                                    {tp("steam", { name: result.data.player.steamUsername })}
                                </p>
                            )}
                            <p className="text-sm text-muted-foreground">
                                {t("joined", { date: format.dateTime(result.data.player.createdAt, { dateStyle: "long" }) })}
                            </p>
                        </div>
                    </div>

                    <h2 className="font-heading text-xl font-bold">{t("clans")}</h2>

                    {result.data.clans.length === 0 ? (
                        <p className="text-muted-foreground">{t("noClans")}</p>
                    ) : (
                        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {result.data.clans.map((membership) => {

                                return (
                                    <li key={membership.id}>
                                        <ClanCard
                                        clan={membership.clan}
                                        role={membership.role}
                                        />
                                    </li>
                                )
                            })}
                        </ul>
                    )}

                    <h2 className="font-heading text-xl font-bold">{t("server")}</h2>

                    {result.data.server ? (
                        <Card className="sm:max-w-sm">
                            <CardHeader>
                                <CardTitle>{result.data.server.serverName}</CardTitle>
                                <CardDescription>
                                    {t("serverEnds", { date: format.dateTime(result.data.server.endsAt, { dateStyle: "long", timeStyle: "short" }) })}
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    ) : (
                        <p className="text-muted-foreground">{t("noServer")}</p>
                    )}

                    <h2 className="font-heading text-xl font-bold">{t("serverHistory")}</h2>

                    <ServerHistory servers={result.data.history}/>
                </>
            )}
        </div>
    )
}
