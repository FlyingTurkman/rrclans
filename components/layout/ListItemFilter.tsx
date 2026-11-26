'use client'

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import { useSearchQuery } from "use-search-query"
import { getItem } from "@/actions/items/get-item"
import ItemSearch from "@/components/items/ItemSearch"
import type { ItemDto } from "@/dtos/itemDTO"









type ListItemFilterProps = {
    // Item id currently in the URL.
    item?: string
}

// Game item filter of a list.
export default function ListItemFilter({ item }: ListItemFilterProps) {
    const t = useTranslations("ListFilters")
    const pathname = usePathname()
    const { routeToSearchParams } = useSearchQuery()

    // Item of the URL, to show its name.
    const [selected, setSelected] = useState<ItemDto | null>(null)

    const isKnown = selected?.id === item

    useEffect(() => {
        if (!item || isKnown) return

        let cancelled = false

        getItem(item)
            .then((result) => {
                if (!cancelled && result.success) setSelected(result.data)
            })
            .catch(() => undefined)

        return () => {
            cancelled = true
        }
    }, [item, isKnown])

    function getTriggerText() {
        if (!item) return t("allItems")

        return selected && isKnown ? selected.name : t("unknownItem")
    }

    return (
        <ItemSearch
        triggerText={getTriggerText()}
        selectedId={item}
        onSelect={(newItem) => {
            setSelected(newItem)
            routeToSearchParams(pathname, { item: newItem.id, page: undefined })
        }}
        clearText={t("allItems")}
        onClear={() => routeToSearchParams(pathname, { item: undefined, page: undefined })}
        />
    )
}
