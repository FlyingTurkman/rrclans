'use client'

import ChangeEmailForm from "@/components/profile/ChangeEmailForm"
import { useSiteContext } from "@/context/SiteContext"









export default function EmailPageClient() {
    const { user } = useSiteContext()

    // Never null here, the layout checks it.
    if (!user) return null

    return (
        <ChangeEmailForm user={user}/>
    )
}
