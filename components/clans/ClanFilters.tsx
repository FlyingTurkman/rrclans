'use client'

import { useTranslations } from "next-intl"
import ListRegionSelect from "@/components/layout/ListRegionSelect"
import ListResetButton from "@/components/layout/ListResetButton"
import ListSearch from "@/components/layout/ListSearch"
import ListSortSelect from "@/components/layout/ListSortSelect"
import type { ClanQuery } from "@/lib/schemas/clan-query.schema"
import { defaultListSort } from "@/lib/src/listSorts"









type ClanFiltersProps = {
    query: ClanQuery
}

// Filters of the clan list. The URL is the only state.
export default function ClanFilters({ query }: ClanFiltersProps) {
    const t = useTranslations("ClansPage")

    const hasFilters = !!query.term || !!query.region || query.sort !== defaultListSort

    return (
        <div className="flex flex-wrap items-center gap-2">
            <ListSearch
            term={query.term}
            triggerText={t("searchTrigger")}
            placeholder={t("searchPlaceholder")}
            />
            <ListRegionSelect region={query.region}/>
            <ListSortSelect sort={query.sort}/>
            {hasFilters && <ListResetButton/>}
        </div>
    )
}
