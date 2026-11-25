'use client'

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { getClans } from "@/actions/clans/get-clans"
import ClanCard from "@/components/clans/ClanCard"
import ClanFilters from "@/components/clans/ClanFilters"
import ListPagination from "@/components/layout/ListPagination"
import { Spinner } from "@/components/ui/spinner"
import { clanQuerySchema, type ClanQuery } from "@/lib/schemas/clan-query.schema"
import type { ActionResult, ClanList } from "@/types"









// Result of the last request and the query it belongs to.
type LoadedClans = {
    query: ClanQuery
    result: ActionResult<ClanList>
}

export default function ClansPageClient() {
    const t = useTranslations("ClansPage")
    const searchParams = useSearchParams()

    const query = useMemo(() => clanQuerySchema.parse(Object.fromEntries(searchParams)), [searchParams])

    const [loaded, setLoaded] = useState<LoadedClans | null>(null)

    // Reload the list when the query in the URL changes. Answers to older
    // queries are ignored.
    useEffect(() => {
        let cancelled = false

        getClans(query)
            .catch((): ActionResult<ClanList> => ({ success: false }))
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

            <ClanFilters query={query}/>

            {!result && (
                <div className="flex justify-center py-10">
                    <Spinner className="size-6" aria-label={t("loading")}/>
                </div>
            )}

            {result && !result.success && (
                <p className="text-destructive">{result.error ?? t("loadError")}</p>
            )}

            {result?.success && result.data.clans.length === 0 && (
                <p className="text-muted-foreground">{t("empty")}</p>
            )}

            {result?.success && result.data.clans.length > 0 && (
                <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {result.data.clans.map((clan) => {

                        return (
                            <li key={clan.id}>
                                <ClanCard clan={clan}/>
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
