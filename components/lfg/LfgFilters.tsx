'use client'

import ListRegionSelect from "@/components/layout/ListRegionSelect"
import ListResetButton from "@/components/layout/ListResetButton"
import ListRoleSelect from "@/components/layout/ListRoleSelect"
import ListSearch from "@/components/layout/ListSearch"
import ListServerSelect from "@/components/layout/ListServerSelect"
import ListSortSelect from "@/components/layout/ListSortSelect"
import type { LfgQuery, LfpQuery } from "@/lib/schemas/lfg-query.schema"
import { lfpRoles } from "@/lib/src/clanRoles"
import { defaultListSort } from "@/lib/src/listSorts"









type LfgFiltersProps = {
    // /lfp also filters by the rank the clan is looking for.
    query: LfgQuery | LfpQuery
    searchTrigger: string
    searchPlaceholder: string
}

// Filters of /lfc and /lfp. The URL is the only state.
export default function LfgFilters({ query, searchTrigger, searchPlaceholder }: LfgFiltersProps) {

    const role = "role" in query ? query.role : undefined
    const hasFilters = !!query.term || !!query.region || !!query.server || !!role || query.sort !== defaultListSort

    return (
        <div className="flex flex-wrap items-center gap-2">
            <ListSearch
            term={query.term}
            triggerText={searchTrigger}
            placeholder={searchPlaceholder}
            />
            <ListRegionSelect region={query.region}/>
            <ListServerSelect server={query.server}/>
            {"role" in query && (
                <ListRoleSelect
                role={role}
                roles={lfpRoles}
                />
            )}
            <ListSortSelect sort={query.sort}/>
            {hasFilters && <ListResetButton/>}
        </div>
    )
}
