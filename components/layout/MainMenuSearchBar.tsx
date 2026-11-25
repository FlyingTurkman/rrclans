'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Spinner } from '@/components/ui/spinner'
import UserAvatar from '@/components/user/UserAvatar'
import { search } from '@/actions/search/search'
import { TERM_MAX_LENGTH } from '@/lib/schemas/list-query.schema'
import type { ActionResult, SearchResults } from '@/types'
import { buttonVariants } from '../ui/button'
import { IoSearch } from 'react-icons/io5'
import { useTranslations } from 'next-intl'









const SEARCH_DELAY = 300

// Result of the last request and the term it belongs to.
type LoadedSearch = {
    term: string
    result: ActionResult<SearchResults>
}

export default function MainMenuSearchBar() {
    const t = useTranslations('Search')
    const router = useRouter()

    const [open, setOpen] = useState(false)
    const [value, setValue] = useState('')
    const [loaded, setLoaded] = useState<LoadedSearch | null>(null)

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

    function handleSelect(href: string) {
        setOpen(false)
        setValue('')
        router.push(href)
    }

    return (
        <Popover
        modal
        open={open}
        onOpenChange={setOpen}
        >
            <PopoverTrigger
            className={buttonVariants({ variant: 'secondary' })}
            >
                {t('trigger')} <IoSearch/>
            </PopoverTrigger>
            <PopoverContent>
                <Command
                shouldFilter={false}
                >
                    <CommandInput
                    placeholder={t('placeholder')}
                    value={value}
                    onValueChange={setValue}
                    maxLength={TERM_MAX_LENGTH}
                    autoComplete="off"
                    />
                    <CommandList>
                        {term && !result && (
                            <div className="flex justify-center py-4">
                                <Spinner aria-label={t('loading')}/>
                            </div>
                        )}

                        {term && result && !result.success && (
                            <p className="py-4 text-center text-sm text-destructive">{result.error ?? t('loadError')}</p>
                        )}

                        {term && result?.success && result.data.clans.length === 0 && result.data.players.length === 0 && (
                            <p className="py-4 text-center text-sm text-muted-foreground">{t('empty')}</p>
                        )}

                        {term && result?.success && result.data.clans.length > 0 && (
                            <CommandGroup heading={t('clans')}>
                                {result.data.clans.map((clan) => {

                                    return (
                                        <CommandItem
                                        key={clan.id}
                                        value={clan.id}
                                        onSelect={() => handleSelect(`/c/${clan.id}`)}
                                        >
                                            [{clan.clanTag}] {clan.clanName}
                                        </CommandItem>
                                    )
                                })}
                            </CommandGroup>
                        )}

                        {term && result?.success && result.data.players.length > 0 && (
                            <CommandGroup heading={t('players')}>
                                {result.data.players.map((player) => {

                                    return (
                                        <CommandItem
                                        key={player.id}
                                        value={player.id}
                                        onSelect={() => handleSelect(`/p/${player.id}`)}
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
                            </CommandGroup>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
