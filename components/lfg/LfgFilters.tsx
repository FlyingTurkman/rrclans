'use client'

import ListRegionSelect from "@/components/layout/ListRegionSelect"
import ListResetButton from "@/components/layout/ListResetButton"
import ListSearch from "@/components/layout/ListSearch"
import ListServerSelect from "@/components/layout/ListServerSelect"
import ListSortSelect from "@/components/layout/ListSortSelect"
import type { LfgQuery } from "@/lib/schemas/lfg-query.schema"
import { defaultListSort } from "@/lib/src/listSorts"









type LfgFiltersProps = {
    query: LfgQuery
    searchTrigger: string
    searchPlaceholder: string
}

// Filters of /lfc and /lfp. The URL is the only state.
export default function LfgFilters({ query, searchTrigger, searchPlaceholder }: LfgFiltersProps) {

    const hasFilters = !!query.term || !!query.region || !!query.server || query.sort !== defaultListSort

    return (
        <div className="flex flex-wrap items-center gap-2">
            <ListSearch
            term={query.term}
            triggerText={searchTrigger}
            placeholder={searchPlaceholder}
            />
            <ListRegionSelect region={query.region}/>
            <ListServerSelect server={query.server}/>
            <ListSortSelect sort={query.sort}/>
            {hasFilters && <ListResetButton/>}
        </div>
    )
}
