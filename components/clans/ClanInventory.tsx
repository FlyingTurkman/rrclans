'use client'

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useFormatter, useTranslations } from "next-intl"
import { IoTrash } from "react-icons/io5"
import { getClanInventory } from "@/actions/clan-inventory/get-clan-inventory"
import { removeInventoryItem } from "@/actions/clan-inventory/remove-inventory-item"
import ClanInventoryForm from "@/components/clans/ClanInventoryForm"
import ConfirmDialog from "@/components/layout/ConfirmDialog"
import ItemImage from "@/components/items/ItemImage"
import ItemRarity from "@/components/items/ItemRarity"
import ListItemFilter from "@/components/layout/ListItemFilter"
import ListPagination from "@/components/layout/ListPagination"
import ListRaritySelect from "@/components/layout/ListRaritySelect"
import ListResetButton from "@/components/layout/ListResetButton"
import ListServerSelect from "@/components/layout/ListServerSelect"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import UserAvatar from "@/components/user/UserAvatar"
import { useClanContext } from "@/context/ClanContext"
import { clanInventoryQuerySchema, type ClanInventoryQuery } from "@/lib/schemas/clan-inventory-query.schema"
import type { ActionResult, ClanInventoryList } from "@/types"









// Result of the last request and the query it belongs to.
type LoadedInventory = {
    query: ClanInventoryQuery
    result: ActionResult<ClanInventoryList>
}

// Items the members of the current clan have on active servers, with filters
// and pagination. Only members see it.
export default function ClanInventory() {
    const t = useTranslations("ClanInventory")
    const format = useFormatter()
    const searchParams = useSearchParams()
    const { clan, viewerRole } = useClanContext()

    const query = useMemo(() => clanInventoryQuerySchema.parse(Object.fromEntries(searchParams)), [searchParams])

    const [loaded, setLoaded] = useState<LoadedInventory | null>(null)
    // Increased to load the list again after a change. The old list stays
    // visible meanwhile.
    const [version, setVersion] = useState(0)

    const isMember = viewerRole !== null

    useEffect(() => {
        if (!isMember) return

        let cancelled = false

        getClanInventory(clan.id, query)
            .catch((): ActionResult<ClanInventoryList> => ({ success: false }))
            .then((result) => {
                if (!cancelled) setLoaded({ query, result })
            })

        return () => {
            cancelled = true
        }
    }, [clan.id, query, version, isMember])

    if (!isMember) {
        return (
            <p className="text-muted-foreground">{t("membersOnly")}</p>
        )
    }

    const result = loaded?.query === query ? loaded.result : null

    const hasFilters = !!query.item || !!query.rarity || !!query.server

    function handleChanged() {
        setVersion((current) => current + 1)
    }

    return (
        <div className="flex flex-col gap-4">
            {result?.success && result.data.viewerServer && (
                <ClanInventoryForm
                server={result.data.viewerServer}
                onSaved={handleChanged}
                />
            )}

            {result?.success && !result.data.viewerServer && (
                <p className="text-muted-foreground">
                    {t.rich("noServerHint", {
                        link: (chunks) => <Link href="/profile/server" className="text-primary hover:underline">{chunks}</Link>,
                    })}
                </p>
            )}

            <div className="flex flex-wrap items-center gap-2">
                <ListItemFilter item={query.item}/>
                <ListRaritySelect rarity={query.rarity}/>
                <ListServerSelect server={query.server}/>
                {hasFilters && <ListResetButton/>}
            </div>

            {!result && (
                <div className="flex justify-center py-10">
                    <Spinner className="size-6" aria-label={t("loading")}/>
                </div>
            )}

            {result && !result.success && (
                <p className="text-destructive">{result.error ?? t("loadError")}</p>
            )}

            {result?.success && result.data.items.length === 0 && (
                <p className="text-muted-foreground">{t("empty")}</p>
            )}

            {result?.success && result.data.items.length > 0 && (
                <ul className="flex flex-col divide-y rounded-xl border">
                    {result.data.items.map((item) => {
                        const name = item.item?.name ?? item.itemId
                        const price = item.item?.price ?? null

                        return (
                            <li
                            key={item.id}
                            className="flex flex-wrap items-center gap-3 px-4 py-3"
                            >
                                {item.item && <ItemImage item={item.item} className="size-12"/>}
                                <div className="flex min-w-0 flex-1 flex-col">
                                    <p className="font-medium">
                                        {name} <span className="text-primary">×{item.quantity}</span>
                                    </p>
                                    {item.item && <ItemRarity item={item.item}/>}
                                    <p className="text-sm text-muted-foreground">
                                        {item.server.serverName}
                                        {price !== null && ` · ${t("price", {
                                            price: format.number(price * item.quantity, { style: "currency", currency: "USD", maximumFractionDigits: 0 }),
                                        })}`}
                                    </p>
                                </div>
                                <Link
                                href={`/p/${item.player.id}`}
                                className="flex min-w-0 items-center gap-2 hover:underline"
                                >
                                    <UserAvatar
                                    username={item.player.username}
                                    avatar={item.player.avatar}
                                    size="sm"
                                    />
                                    <span className="truncate">{item.player.username}</span>
                                </Link>
                                {item.canRemove && (
                                    <ConfirmDialog
                                    trigger={<Button variant="ghost" size="icon" aria-label={t("remove", { name })} title={t("remove", { name })}/>}
                                    title={t("removeTitle")}
                                    description={t("removeDescription", { name })}
                                    confirmLabel={t("removeConfirm")}
                                    onConfirm={() => removeInventoryItem(item.id)}
                                    onSuccess={handleChanged}
                                    >
                                        <IoTrash/>
                                    </ConfirmDialog>
                                )}
                            </li>
                        )
                    })}
                </ul>
            )}

            {result?.success && (
                <ListPagination
                page={query.page}
                pageCount={result.data.pageCount}
                />
            )}
        </div>
    )
}
