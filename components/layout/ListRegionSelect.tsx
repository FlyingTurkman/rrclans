'use client'

import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import { useSearchQuery } from "use-search-query"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { regions, type Region } from "@/lib/src/regions"









// Select value for "no region filter".
const ALL_REGIONS = "all"

type ListRegionSelectProps = {
    // Region currently in the URL.
    region?: Region
}

// Region filter of a list.
export default function ListRegionSelect({ region }: ListRegionSelectProps) {
    const t = useTranslations("ListFilters")
    const pathname = usePathname()
    const { routeToSearchParams } = useSearchQuery()

    const items = [
        { value: ALL_REGIONS, label: t("allRegions") },
        ...regions.map((value) => ({ value, label: t(`regions.${value}`) })),
    ]

    return (
        <Select
        items={items}
        value={region ?? ALL_REGIONS}
        onValueChange={(newRegion) => {
            routeToSearchParams(pathname, { region: newRegion === ALL_REGIONS ? undefined : newRegion, page: undefined })
        }}
        >
            <SelectTrigger aria-label={t("regionLabel")}>
                <SelectValue/>
            </SelectTrigger>
            <SelectContent>
                {items.map((item) => {

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
    )
}
