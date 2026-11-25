'use client'

import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import { useSearchQuery } from "use-search-query"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { defaultListSort, listSorts, type ListSort } from "@/lib/src/listSorts"









type ListSortSelectProps = {
    // Sort currently in the URL.
    sort: ListSort
}

// Sort select of every filtered list.
export default function ListSortSelect({ sort }: ListSortSelectProps) {
    const t = useTranslations("ListFilters")
    const pathname = usePathname()
    const { routeToSearchParams } = useSearchQuery()

    const items = listSorts.map((value) => ({ value, label: t(`sorts.${value}`) }))

    return (
        <Select
        items={items}
        value={sort}
        onValueChange={(newSort) => {
            routeToSearchParams(pathname, { sort: newSort === defaultListSort ? undefined : newSort, page: undefined })
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
