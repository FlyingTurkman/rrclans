'use client'

import LfpOwnListings from "@/components/lfg/LfpOwnListings"
import { useClanContext } from "@/context/ClanContext"









// LFP listing of the clan, the same one as on /lfp.
export default function LfpPageClient() {
    const { clan } = useClanContext()

    return (
        <LfpOwnListings clanId={clan.id}/>
    )
}
