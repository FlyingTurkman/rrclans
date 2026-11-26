'use client'

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { IoCheckmark, IoSearch } from "react-icons/io5"
import { searchItems } from "@/actions/items/search-items"
import ItemImage from "@/components/items/ItemImage"
import ItemRarity from "@/components/items/ItemRarity"
import { buttonVariants } from "@/components/ui/button"
import { Command, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Spinner } from "@/components/ui/spinner"
import type { ItemDto } from "@/dtos/itemDTO"
import { TERM_MAX_LENGTH } from "@/lib/schemas/list-query.schema"
import type { ActionResult } from "@/types"









const SEARCH_DELAY = 300

// Result of the last request and the term it belongs to.
type LoadedItems = {
    term: string
    result: ActionResult<ItemDto[]>
}

type ItemSearchProps = {
    triggerText: string
    selectedId?: string
    disabled?: boolean
    id?: string
    invalid?: boolean
    onSelect: (item: ItemDto) => void
    // Adds an item that clears the selection.
    clearText?: string
    onClear?: () => void
}

// Item select: searches in the backend, without a term it shows the first items.
export default function ItemSearch({ triggerText, selectedId, disabled, id, invalid, onSelect, clearText, onClear }: ItemSearchProps) {
    const t = useTranslations("ItemSearch")

    const [open, setOpen] = useState(false)
    const [value, setValue] = useState("")
    const [loaded, setLoaded] = useState<LoadedItems | null>(null)

    const term = value.trim()

    // Search after the user stops typing, at once when the popover opens.
    // Answers to older terms are ignored.
    useEffect(() => {
        if (!open) return

        let cancelled = false

        const timer = setTimeout(() => {
            searchItems({ term })
                .catch((): ActionResult<ItemDto[]> => ({ success: false }))
                .then((result) => {
                    if (!cancelled) setLoaded({ term, result })
                })
        }, term ? SEARCH_DELAY : 0)

        return () => {
            cancelled = true
            clearTimeout(timer)
        }
    }, [open, term])

    const result = loaded?.term === term ? loaded.result : null

    function handleOpenChange(newOpen: boolean) {
        setOpen(newOpen)

        if (newOpen) {
            setValue("")
            setLoaded(null)
        }
    }

    return (
        <Popover
        modal
        open={open}
        onOpenChange={handleOpenChange}
        >
            <PopoverTrigger
            id={id}
            className={buttonVariants({ variant: "outline", className: "self-start" })}
            disabled={disabled}
            aria-invalid={invalid}
            >
                {triggerText} <IoSearch/>
            </PopoverTrigger>
            <PopoverContent className="w-80">
                <Command
                shouldFilter={false}
                >
                    <CommandInput
                    placeholder={t("placeholder")}
                    value={value}
                    onValueChange={setValue}
                    maxLength={TERM_MAX_LENGTH}
                    autoComplete="off"
                    />
                    <CommandList>
                        {clearText && !term && (
                            <CommandItem
                            value="clear"
                            onSelect={() => {
                                setOpen(false)
                                onClear?.()
                            }}
                            >
                                {clearText}
                            </CommandItem>
                        )}

                        {!result && (
                            <div className="flex justify-center py-4">
                                <Spinner aria-label={t("loading")}/>
                            </div>
                        )}

                        {result && !result.success && (
                            <p className="py-4 text-center text-sm text-destructive">{result.error ?? t("loadError")}</p>
                        )}

                        {result?.success && result.data.length === 0 && (
                            <p className="py-4 text-center text-sm text-muted-foreground">{t("empty")}</p>
                        )}

                        {result?.success && result.data.map((item) => {

                            return (
                                <CommandItem
                                key={item.id}
                                value={item.id}
                                onSelect={() => {
                                    setOpen(false)
                                    onSelect(item)
                                }}
                                >
                                    <ItemImage item={item}/>
                                    <span className="flex min-w-0 flex-1 flex-col">
                                        <span className="truncate">{item.name}</span>
                                        <ItemRarity item={item}/>
                                    </span>
                                    {item.id === selectedId && <IoCheckmark/>}
                                </CommandItem>
                            )
                        })}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
