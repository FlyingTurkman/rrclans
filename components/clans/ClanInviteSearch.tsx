'use client'

import { useEffect, useState, useTransition } from "react"
import { useTranslations } from "next-intl"
import { IoSearch } from "react-icons/io5"
import { invitePlayer } from "@/actions/clan-panel/invite-player"
import { search } from "@/actions/search/search"
import { buttonVariants } from "@/components/ui/button"
import { Command, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Spinner } from "@/components/ui/spinner"
import UserAvatar from "@/components/user/UserAvatar"
import { useClanContext } from "@/context/ClanContext"
import { TERM_MAX_LENGTH } from "@/lib/schemas/list-query.schema"
import type { ActionResult, SearchResults } from "@/types"









const SEARCH_DELAY = 300

// Result of the last request and the term it belongs to.
type LoadedSearch = {
    term: string
    result: ActionResult<SearchResults>
}

type ClanInviteSearchProps = {
    onInvited: () => void
}

// Searches a player and invites them to the clan.
export default function ClanInviteSearch({ onInvited }: ClanInviteSearchProps) {
    const t = useTranslations("ClanPanel")
    const ts = useTranslations("Search")
    const { clan } = useClanContext()

    const [open, setOpen] = useState(false)
    const [value, setValue] = useState("")
    const [loaded, setLoaded] = useState<LoadedSearch | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()

    const term = value.trim()

    // Search after the user stops typing. Answers to older terms are ignored.
    useEffect(() => {
        if (!term) return

        let cancelled = false

        const timer = setTimeout(() => {
            search({ term })
                .catch((): ActionResult<SearchResults> => ({ success: false }))
                .then((result) => {
                    if (!cancelled) setLoaded({ term, result })
                })
        }, SEARCH_DELAY)

        return () => {
            cancelled = true
            clearTimeout(timer)
        }
    }, [term])

    const result = loaded?.term === term ? loaded.result : null

    function handleInvite(userId: string) {
        setError(null)

        startTransition(async () => {
            try {
                const invited = await invitePlayer(clan.id, userId)

                if (invited.success) {
                    setOpen(false)
                    setValue("")
                    onInvited()
                } else {
                    setError(invited.error ?? t("actionError"))
                }
            } catch {
                setError(t("actionError"))
            }
        })
    }

    return (
        <Popover
        modal
        open={open}
        onOpenChange={(newOpen) => {
            setError(null)
            setOpen(newOpen)
        }}
        >
            <PopoverTrigger
            className={buttonVariants({ variant: "outline", className: "self-start" })}
            >
                {t("invite")} <IoSearch/>
            </PopoverTrigger>
            <PopoverContent>
                <Command
                shouldFilter={false}
                >
                    <CommandInput
                    placeholder={t("invitePlaceholder")}
                    value={value}
                    onValueChange={setValue}
                    maxLength={TERM_MAX_LENGTH}
                    autoComplete="off"
                    />
                    <CommandList>
                        {error && <p className="py-2 text-center text-sm text-destructive">{error}</p>}

                        {term && !result && (
                            <div className="flex justify-center py-4">
                                <Spinner aria-label={ts("loading")}/>
                            </div>
                        )}

                        {term && result && !result.success && (
                            <p className="py-4 text-center text-sm text-destructive">{result.error ?? ts("loadError")}</p>
                        )}

                        {term && result?.success && result.data.players.length === 0 && (
                            <p className="py-4 text-center text-sm text-muted-foreground">{ts("empty")}</p>
                        )}

                        {term && result?.success && result.data.players.map((player) => {

                            return (
                                <CommandItem
                                key={player.id}
                                value={player.id}
                                disabled={isPending}
                                onSelect={() => handleInvite(player.id)}
                                >
                                    <UserAvatar
                                    username={player.username}
                                    avatar={player.avatar}
                                    size="sm"
                                    />
                                    {player.username}
                                </CommandItem>
                            )
                        })}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
