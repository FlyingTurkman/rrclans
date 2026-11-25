'use client'

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { getLfpListings } from "@/actions/lfp/get-lfp-listings"
import ListPagination from "@/components/layout/ListPagination"
import LfpCard from "@/components/lfg/LfpCard"
import LfpOwnListings from "@/components/lfg/LfpOwnListings"
import LfgFilters from "@/components/lfg/LfgFilters"
import { buttonVariants } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { useSiteContext } from "@/context/SiteContext"
import { lfgQuerySchema, type LfgQuery } from "@/lib/schemas/lfg-query.schema"
import type { ActionResult, LfpList } from "@/types"









// Result of the last request and the query it belongs to.
type LoadedListings = {
    query: LfgQuery
    result: ActionResult<LfpList>
}

// Looking for player: clans that search for players.
export default function LfpPageClient() {
    const t = useTranslations("LfpPage")
    const searchParams = useSearchParams()
    const { user, isUserLoading } = useSiteContext()

    const query = useMemo(() => lfgQuerySchema.parse(Object.fromEntries(searchParams)), [searchParams])

    const [loaded, setLoaded] = useState<LoadedListings | null>(null)
    // Increased to load the list again after a change.
    const [version, setVersion] = useState(0)

    useEffect(() => {
        let cancelled = false

        getLfpListings(query)
            .catch((): ActionResult<LfpList> => ({ success: false }))
            .then((result) => {
                if (!cancelled) setLoaded({ query, result })
            })

        return () => {
            cancelled = true
        }
    }, [query, version])

    const result = loaded?.query === query ? loaded.result : null

    return (
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8">
            <div>
                <h1 className="font-heading text-3xl font-extrabold italic uppercase font-stretch-condensed">
                    {t("title")}
                </h1>
                <p className="text-muted-foreground">{t("description")}</p>
            </div>

            {user && (
                <LfpOwnListings
                key={user.id}
                onChanged={() => setVersion((current) => current + 1)}
                />
            )}

            {!user && !isUserLoading && (
                <Link
                href="/auth/login?next=/lfp"
                className={buttonVariants({ variant: "outline", className: "self-start" })}
                >
                    {t("login")}
                </Link>
            )}

            <LfgFilters
            query={query}
            searchTrigger={t("searchTrigger")}
            searchPlaceholder={t("searchPlaceholder")}
            />

            {!result && (
                <div className="flex justify-center py-10">
                    <Spinner className="size-6" aria-label={t("loading")}/>
                </div>
            )}

            {result && !result.success && (
                <p className="text-destructive">{result.error ?? t("loadError")}</p>
            )}

            {result?.success && result.data.listings.length === 0 && (
                <p className="text-muted-foreground">{t("empty")}</p>
            )}

            {result?.success && result.data.listings.length > 0 && (
                <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {result.data.listings.map((listing) => {

                        return (
                            <li key={listing.id}>
                                <LfpCard listing={listing}/>
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
