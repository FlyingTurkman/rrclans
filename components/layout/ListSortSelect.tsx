'use client'

import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import { useSearchQuery } from "use-search-query"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { listSorts, type MemberSort } from "@/lib/src/listSorts"









type ListSortSelectProps = {
    // Sort currently in the URL.
    sort: MemberSort
    // Options of the list, the first one is the default.
    sorts?: readonly MemberSort[]
}

// Sort select of every filtered list.
export default function ListSortSelect({ sort, sorts = listSorts }: ListSortSelectProps) {
    const t = useTranslations("ListFilters")
    const pathname = usePathname()
    const { routeToSearchParams } = useSearchQuery()

    const items = sorts.map((value) => ({ value, label: t(`sorts.${value}`) }))

    return (
        <Select
        items={items}
        value={sort}
        onValueChange={(newSort) => {
            routeToSearchParams(pathname, { sort: newSort === sorts[0] ? undefined : newSort, page: undefined })
        }}
        >
            <SelectTrigger aria-label={t("sortLabel")}>
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
