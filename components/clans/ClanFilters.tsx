'use client'

import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import { useSearchQuery } from "use-search-query"
import ListResetButton from "@/components/layout/ListResetButton"
import ListSearch from "@/components/layout/ListSearch"
import ListSortSelect from "@/components/layout/ListSortSelect"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ClanQuery } from "@/lib/schemas/clan-query.schema"
import { defaultListSort } from "@/lib/src/listSorts"
import { regions } from "@/lib/src/regions"









// Select value for "no region filter".
const ALL_REGIONS = "all"

type ClanFiltersProps = {
    query: ClanQuery
}

// Filters of the clan list. The URL is the only state: every change goes
// through useSearchQuery and returns to the first page.
export default function ClanFilters({ query }: ClanFiltersProps) {
    const t = useTranslations("ClansPage")
    const pathname = usePathname()
    const { routeToSearchParams } = useSearchQuery()

    const regionItems = [
        { value: ALL_REGIONS, label: t("allRegions") },
        ...regions.map((region) => ({ value: region, label: t(`regions.${region}`) })),
    ]

    const hasFilters = !!query.term || !!query.region || query.sort !== defaultListSort

    return (
        <div className="flex flex-wrap items-center gap-2">
            <ListSearch
            term={query.term}
            triggerText={t("searchTrigger")}
            placeholder={t("searchPlaceholder")}
            />
            <Select
            items={regionItems}
            value={query.region ?? ALL_REGIONS}
            onValueChange={(region) => {
                routeToSearchParams(pathname, { region: region === ALL_REGIONS ? undefined : region, page: undefined })
            }}
            >
                <SelectTrigger aria-label={t("regionLabel")}>
                    <SelectValue/>
                </SelectTrigger>
                <SelectContent>
                    {regionItems.map((item) => {

                        return (
                            <SelectItem
                            key={item.value}
                            value={item.value}
                            >
                                {item.label}
                            </SelectItem>
                        )
                    })}
                </SelectContent>
            </Select>
            <ListSortSelect sort={query.sort}/>
            {hasFilters && <ListResetButton/>}
        </div>
    )
}
