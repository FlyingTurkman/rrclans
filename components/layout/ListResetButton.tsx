'use client'

import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import { useSearchQuery } from "use-search-query"
import { Button } from "@/components/ui/button"









// Clears every filter of a list. Show it only while a filter is active.
export default function ListResetButton() {
    const t = useTranslations("ListFilters")
    const pathname = usePathname()
    const { routeToSearchParams } = useSearchQuery()

    return (
        <Button
        variant="ghost"
        onClick={() => routeToSearchParams(pathname, {}, { reset: true })}
        >
            {t("reset")}
        </Button>
    )
}
