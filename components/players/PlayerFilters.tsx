'use client'

import { useTranslations } from "next-intl"
import ListResetButton from "@/components/layout/ListResetButton"
import ListSearch from "@/components/layout/ListSearch"
import ListSortSelect from "@/components/layout/ListSortSelect"
import type { PlayerQuery } from "@/lib/schemas/player-query.schema"
import { defaultListSort } from "@/lib/src/listSorts"









type PlayerFiltersProps = {
    query: PlayerQuery
}

// Filters of the player list. The URL is the only state.
export default function PlayerFilters({ query }: PlayerFiltersProps) {
    const t = useTranslations("PlayersPage")

    const hasFilters = !!query.term || query.sort !== defaultListSort

    return (
        <div className="flex flex-wrap items-center gap-2">
            <ListSearch
            term={query.term}
            triggerText={t("searchTrigger")}
            placeholder={t("searchPlaceholder")}
            />
            <ListSortSelect sort={query.sort}/>
            {hasFilters && <ListResetButton/>}
        </div>
    )
}
