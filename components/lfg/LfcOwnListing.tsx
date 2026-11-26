'use client'

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { deleteLfcListing } from "@/actions/lfc/delete-lfc-listing"
import { getMyLfcListing } from "@/actions/lfc/get-my-lfc-listing"
import LfcForm from "@/components/lfg/LfcForm"
import LfgOwnCard from "@/components/lfg/LfgOwnCard"
import LfgServers from "@/components/lfg/LfgServers"
import type { OwnLfcListing } from "@/types"









type LfcOwnListingProps = {
    onChanged: () => void
}

// Listing of the logged-in player.
export default function LfcOwnListing({ onChanged }: LfcOwnListingProps) {
    const t = useTranslations("Lfg")

    // Undefined until it is loaded.
    const [listing, setListing] = useState<OwnLfcListing | null | undefined>(undefined)
    const [version, setVersion] = useState(0)

    useEffect(() => {
        let cancelled = false

        getMyLfcListing()
            .then((result) => {
                if (!cancelled && result.success) setListing(result.data)
            })
            .catch(() => undefined)

        return () => {
            cancelled = true
        }
    }, [version])

    function handleChanged() {
        setVersion((current) => current + 1)
        onChanged()
    }

    if (listing === undefined) return null

    return (
        <LfgOwnCard
        title={t("yourListing")}
        message={listing?.message ?? null}
        details={listing && <LfgServers servers={listing.servers}/>}
        onChanged={handleChanged}
        onDelete={deleteLfcListing}
        renderForm={(close) => {

            return (
                <LfcForm
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
}
