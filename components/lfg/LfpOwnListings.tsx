'use client'

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { deleteLfpListing } from "@/actions/lfp/delete-lfp-listing"
import { getMyLfpClans } from "@/actions/lfp/get-my-lfp-clans"
import LfgOwnCard from "@/components/lfg/LfgOwnCard"
import LfgServers from "@/components/lfg/LfgServers"
import LfpForm from "@/components/lfg/LfpForm"
import type { ManagedLfpClan } from "@/types"









type LfpOwnListingsProps = {
    // Only the listing of this clan (clan panel).
    clanId?: string
    onChanged?: () => void
}

// Listings of the clans the logged-in user manages (leader and officers).
export default function LfpOwnListings({ clanId, onChanged }: LfpOwnListingsProps) {
    const t = useTranslations("Lfg")
    const tr = useTranslations("ClanRoles")

    const [clans, setClans] = useState<ManagedLfpClan[]>([])
    const [version, setVersion] = useState(0)

    useEffect(() => {
        let cancelled = false

        getMyLfpClans()
            .then((result) => {
                if (!cancelled && result.success) setClans(result.data)
            })
            .catch(() => undefined)

        return () => {
            cancelled = true
        }
    }, [version])

    function handleChanged() {
        setVersion((current) => current + 1)
        onChanged?.()
    }

    return (
        <>
            {clans.filter(({ clan }) => !clanId || clan.id === clanId).map(({ clan, servers, listing }) => {

                return (
                    <LfgOwnCard
                    key={clan.id}
                    title={t("clanListing", { name: `[${clan.clanTag}] ${clan.clanName}` })}
                    message={listing?.message ?? null}
                    details={listing && (
                        <div className="flex flex-col gap-2">
                            <p className="text-sm">{t("lookingFor", { role: tr(listing.role) })}</p>
                            <LfgServers servers={servers.filter(({ id }) => listing.serverIds.includes(id))}/>
                        </div>
                    )}
                    onChanged={handleChanged}
                    onDelete={() => deleteLfpListing(clan.id)}
                    renderForm={(close) => {

                        return (
                            <LfpForm
                            clanId={clan.id}
                            servers={servers}
                            listing={listing}
                            onSaved={() => {
                                close()
                                handleChanged()
                            }}
                            onCancel={close}
                            />
                        )
                    }}
                    />
                )
            })}
        </>
    )
}
