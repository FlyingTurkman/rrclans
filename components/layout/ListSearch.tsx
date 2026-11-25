'use client'

import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import { IoSearch } from "react-icons/io5"
import { useSearchQuery } from "use-search-query"
import { buttonVariants } from "@/components/ui/button"
import { Command, CommandInput, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { TERM_MAX_LENGTH } from "@/lib/schemas/list-query.schema"









const SEARCH_DELAY = 400

type ListSearchProps = {
    // Term currently in the URL.
    term: string
    triggerText: string
    placeholder: string
}

// Text filter of every filtered list. Typing updates the URL after a short delay,
// closing the popover applies the term right away.
export default function ListSearch({ term, triggerText, placeholder }: ListSearchProps) {
    const pathname = usePathname()
    const { routeToSearchParams } = useSearchQuery()

    const [value, setValue] = useState(term)
    const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

    useEffect(() => {
        return () => clearTimeout(timer.current)
    }, [])

    function applyTerm(newTerm: string) {
        routeToSearchParams(pathname, { term: newTerm, page: undefined })
    }

    function handleValueChange(newValue: string) {
        setValue(newValue)
        clearTimeout(timer.current)
        timer.current = setTimeout(() => applyTerm(newValue), SEARCH_DELAY)
    }

    function handleOpenChange(open: boolean) {
        if (open) {
            setValue(term)
            return
        }

        clearTimeout(timer.current)

        if (value.trim() !== term) applyTerm(value)
    }

    return (
        <Popover
        modal
        onOpenChange={handleOpenChange}
        >
            <PopoverTrigger
            className={buttonVariants({ variant: "outline" })}
            >
                {term || triggerText} <IoSearch/>
            </PopoverTrigger>
            <PopoverContent>
                <Command
                shouldFilter={false}
                >
                    <CommandInput
                    placeholder={placeholder}
                    value={value}
                    onValueChange={handleValueChange}
                    maxLength={TERM_MAX_LENGTH}
                    autoComplete="off"
                    />
                    <CommandList/>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
