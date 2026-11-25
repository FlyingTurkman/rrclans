'use client'

import { useEffect, useMemo, useState, type ReactNode } from "react"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { getClanMembers } from "@/actions/clans/get-clan-members"
import ListPagination from "@/components/layout/ListPagination"
import ListResetButton from "@/components/layout/ListResetButton"
import ListRoleSelect from "@/components/layout/ListRoleSelect"
import ListSearch from "@/components/layout/ListSearch"
import ListServerSelect from "@/components/layout/ListServerSelect"
import ListSortSelect from "@/components/layout/ListSortSelect"
import { Spinner } from "@/components/ui/spinner"
import { useClanContext } from "@/context/ClanContext"
import type { ClanMemberDto } from "@/dtos/clanMemberDTO"
import { clanMemberQuerySchema, type ClanMemberQuery } from "@/lib/schemas/clan-member-query.schema"
import { defaultMemberSort, memberSorts } from "@/lib/src/listSorts"
import type { ActionResult, ClanMemberList as ClanMemberListData } from "@/types"









// Result of the last request and the query it belongs to.
type LoadedMembers = {
    query: ClanMemberQuery
    result: ActionResult<ClanMemberListData>
}

type ClanMemberListProps = {
    // `onChanged` loads the list and the clan again after a change.
    renderMembers: (members: ClanMemberDto[], onChanged: () => void) => ReactNode
}

// Members of the current clan with search, filters and pagination.
export default function ClanMemberList({ renderMembers }: ClanMemberListProps) {
    const t = useTranslations("ClanMembers")
    const searchParams = useSearchParams()
    const { clan, reload } = useClanContext()

    const query = useMemo(() => clanMemberQuerySchema.parse(Object.fromEntries(searchParams)), [searchParams])

    const [loaded, setLoaded] = useState<LoadedMembers | null>(null)
    // Increased to load the list again after a change. The old list stays
    // visible meanwhile.
    const [version, setVersion] = useState(0)

    useEffect(() => {
        let cancelled = false

        getClanMembers(clan.id, query)
            .catch((): ActionResult<ClanMemberListData> => ({ success: false }))
            .then((result) => {
                if (!cancelled) setLoaded({ query, result })
            })

        return () => {
            cancelled = true
        }
    }, [clan.id, query, version])

    const result = loaded?.query === query ? loaded.result : null

    const hasFilters = !!query.term || !!query.role || !!query.server || query.sort !== defaultMemberSort

    function handleChanged() {
        setVersion((current) => current + 1)
        reload()
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
                <ListSearch
                term={query.term}
                triggerText={t("searchTrigger")}
                placeholder={t("searchPlaceholder")}
                />
                <ListRoleSelect role={query.role}/>
                <ListServerSelect server={query.server}/>
                <ListSortSelect
                sort={query.sort}
                sorts={memberSorts}
                />
                {hasFilters && <ListResetButton/>}
            </div>

            {!result && (
                <div className="flex justify-center py-10">
                    <Spinner className="size-6" aria-label={t("loading")}/>
                </div>
            )}

            {result && !result.success && (
                <p className="text-destructive">{result.error ?? t("loadError")}</p>
            )}

            {result?.success && result.data.members.length === 0 && (
                <p className="text-muted-foreground">{t("empty")}</p>
            )}

            {result?.success && result.data.members.length > 0 && renderMembers(result.data.members, handleChanged)}

            {result?.success && (
                <ListPagination
                page={query.page}
                pageCount={result.data.pageCount}
                />
            )}
        </div>
    )
}
