'use client'

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { getPlayers } from "@/actions/players/get-players"
import PlayerCard from "@/components/players/PlayerCard"
import PlayerFilters from "@/components/players/PlayerFilters"
import ListPagination from "@/components/layout/ListPagination"
import { Spinner } from "@/components/ui/spinner"
import { playerQuerySchema, type PlayerQuery } from "@/lib/schemas/player-query.schema"
import type { ActionResult, PlayerList } from "@/types"









// Result of the last request and the query it belongs to.
type LoadedPlayers = {
    query: PlayerQuery
    result: ActionResult<PlayerList>
}

export default function PlayersPageClient() {
    const t = useTranslations("PlayersPage")
    const searchParams = useSearchParams()

    const query = useMemo(() => playerQuerySchema.parse(Object.fromEntries(searchParams)), [searchParams])

    const [loaded, setLoaded] = useState<LoadedPlayers | null>(null)

    // Reload the list when the query in the URL changes. Answers to older
    // queries are ignored.
    useEffect(() => {
        let cancelled = false

        getPlayers(query)
            .catch((): ActionResult<PlayerList> => ({ success: false }))
            .then((result) => {
                if (!cancelled) setLoaded({ query, result })
            })

        return () => {
            cancelled = true
        }
    }, [query])

    const result = loaded?.query === query ? loaded.result : null

    return (
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8">
            <h1 className="font-heading text-3xl font-extrabold italic uppercase font-stretch-condensed">
                {t("title")}
            </h1>

            <PlayerFilters query={query}/>

            {!result && (
                <div className="flex justify-center py-10">
                    <Spinner className="size-6" aria-label={t("loading")}/>
                </div>
            )}

            {result && !result.success && (
                <p className="text-destructive">{result.error ?? t("loadError")}</p>
            )}

            {result?.success && result.data.players.length === 0 && (
                <p className="text-muted-foreground">{t("empty")}</p>
            )}

            {result?.success && result.data.players.length > 0 && (
                <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {result.data.players.map((player) => {

                        return (
                            <li key={player.id}>
                                <PlayerCard player={player}/>
                            </li>
                        )
                    })}
                </ul>
            )}

            {result?.success && (
                <ListPagination
                page={query.page}
                pageCount={result.data.pageCount}
                />
            )}
        </div>
    )
}
