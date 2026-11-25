'use client'

import ProfileForm from "@/components/profile/ProfileForm"
import { useSiteContext } from "@/context/SiteContext"









// First page of the profile: username and name.
export default function ProfilePageClient() {
    const { user } = useSiteContext()

    // Never null here, the layout checks it.
    if (!user) return null

    return (
        <ProfileForm
        key={user.id}
        user={user}
        />
    )
}
