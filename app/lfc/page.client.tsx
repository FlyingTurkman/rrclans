'use client'

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { getLfcListings } from "@/actions/lfc/get-lfc-listings"
import ListPagination from "@/components/layout/ListPagination"
import LfcCard from "@/components/lfg/LfcCard"
import LfcOwnListing from "@/components/lfg/LfcOwnListing"
import LfgFilters from "@/components/lfg/LfgFilters"
import { buttonVariants } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { useSiteContext } from "@/context/SiteContext"
import { lfgQuerySchema, type LfgQuery } from "@/lib/schemas/lfg-query.schema"
import type { ActionResult, LfcList } from "@/types"









// Result of the last request and the query it belongs to.
type LoadedListings = {
    query: LfgQuery
    result: ActionResult<LfcList>
}

// Looking for clan: players who search for a clan.
export default function LfcPageClient() {
    const t = useTranslations("LfcPage")
    const searchParams = useSearchParams()
    const { user, isUserLoading } = useSiteContext()

    const query = useMemo(() => lfgQuerySchema.parse(Object.fromEntries(searchParams)), [searchParams])

    const [loaded, setLoaded] = useState<LoadedListings | null>(null)
    // Increased to load the list again after a change.
    const [version, setVersion] = useState(0)

    useEffect(() => {
        let cancelled = false

        getLfcListings(query)
            .catch((): ActionResult<LfcList> => ({ success: false }))
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
                <LfcOwnListing
                key={user.id}
                onChanged={() => setVersion((current) => current + 1)}
                />
            )}

            {!user && !isUserLoading && (
                <Link
                href="/auth/login?next=/lfc"
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
                                <LfcCard listing={listing}/>
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
