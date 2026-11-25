'use client'

import type { MouseEvent } from "react"
import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import { useSearchQuery } from "use-search-query"
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"









// Page numbers to show: first, last and the neighbours of the current page.
// Gaps become "start" / "end" (ellipsis).
function getPages(current: number, pageCount: number) {
    const pages: (number | "start" | "end")[] = [1]
    const from = Math.max(2, current - 1)
    const to = Math.min(pageCount - 1, current + 1)

    if (from > 2) pages.push("start")

    for (let page = from; page <= to; page++) pages.push(page)

    if (to < pageCount - 1) pages.push("end")
    if (pageCount > 1) pages.push(pageCount)

    return pages
}

type ListPaginationProps = {
    // Page in the URL, it can be past the last page.
    page: number
    pageCount: number
}

// Pagination of every filtered list. Changes only the `page` search param and
// keeps the other filters.
export default function ListPagination({ page, pageCount }: ListPaginationProps) {
    const t = useTranslations("Pagination")
    const pathname = usePathname()
    const { routeToSearchParams, setSearchParams } = useSearchQuery()

    if (pageCount <= 1 && page <= 1) return null

    const previous = Math.max(1, Math.min(page - 1, pageCount))
    const next = Math.min(page + 1, pageCount)

    // The first page has no `page` param.
    function getLinkProps(target: number) {
        const updates = { page: target > 1 ? target : undefined }

        return {
            href: `${pathname}?${setSearchParams(updates)}`,
            onClick: (event: MouseEvent<HTMLAnchorElement>) => {
                // Let the browser open new tabs and windows.
                if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return

                event.preventDefault()
                routeToSearchParams(pathname, updates, { scroll: true })
            },
        }
    }

    const disabledProps = { "aria-disabled": true, tabIndex: -1, className: "pointer-events-none opacity-50" }

    return (
        <Pagination aria-label={t("label")}>
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious
                    text={t("previous")}
                    aria-label={t("previous")}
                    {...getLinkProps(previous)}
                    {...(page <= 1 ? disabledProps : {})}
                    />
                </PaginationItem>
                {getPages(Math.min(page, pageCount), pageCount).map((item) => {

                    return (
                        <PaginationItem key={item}>
                            {typeof item === "number" ? (
                                <PaginationLink
                                isActive={item === page}
                                aria-label={t("page", { page: item })}
                                {...getLinkProps(item)}
                                >
                                    {item}
                                </PaginationLink>
                            ) : (
                                <PaginationEllipsis/>
                            )}
                        </PaginationItem>
                    )
                })}
                <PaginationItem>
                    <PaginationNext
                    text={t("next")}
                    aria-label={t("next")}
                    {...getLinkProps(next)}
                    {...(page >= pageCount ? disabledProps : {})}
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    )
}
