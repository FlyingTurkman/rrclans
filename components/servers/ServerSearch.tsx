'use client'

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { IoCheckmark, IoSearch } from "react-icons/io5"
import { buttonVariants } from "@/components/ui/button"
import { Command, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Spinner } from "@/components/ui/spinner"
import type { ServerDto } from "@/dtos/serverDTO"
import { TERM_MAX_LENGTH } from "@/lib/schemas/list-query.schema"
import type { ActionResult } from "@/types"









const SEARCH_DELAY = 300

// Result of the last request and the term it belongs to.
type LoadedServers = {
    term: string
    result: ActionResult<ServerDto[]>
}

type ServerSearchProps = {
    triggerText: string
    // Must be stable (module function or useCallback).
    search: (input: { term: string }) => Promise<ActionResult<ServerDto[]>>
    selectedId?: string
    disabled?: boolean
    onSelect: (server: ServerDto) => void
    // Adds an item that clears the selection.
    clearText?: string
    onClear?: () => void
}

// Server select: searches in the backend, without a term it shows the newest.
export default function ServerSearch({ triggerText, search, selectedId, disabled, onSelect, clearText, onClear }: ServerSearchProps) {
    const t = useTranslations("ServerSearch")

    const [open, setOpen] = useState(false)
    const [value, setValue] = useState("")
    const [loaded, setLoaded] = useState<LoadedServers | null>(null)

    const term = value.trim()

    // Search after the user stops typing, at once when the popover opens.
    // Answers to older terms are ignored.
    useEffect(() => {
        if (!open) return

        let cancelled = false

        const timer = setTimeout(() => {
            search({ term })
                .catch((): ActionResult<ServerDto[]> => ({ success: false }))
                .then((result) => {
                    if (!cancelled) setLoaded({ term, result })
                })
        }, term ? SEARCH_DELAY : 0)

        return () => {
            cancelled = true
            clearTimeout(timer)
        }
    }, [open, term, search])

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
            className={buttonVariants({ variant: "outline", className: "self-start" })}
            disabled={disabled}
            >
                {triggerText} <IoSearch/>
            </PopoverTrigger>
            <PopoverContent>
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

                        {result?.success && result.data.map((server) => {

                            return (
                                <CommandItem
                                key={server.id}
                                value={server.id}
                                onSelect={() => {
                                    setOpen(false)
                                    onSelect(server)
                                }}
                                >
                                    {server.serverName}
                                    {server.id === selectedId && <IoCheckmark className="ml-auto"/>}
                                </CommandItem>
                            )
                        })}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
