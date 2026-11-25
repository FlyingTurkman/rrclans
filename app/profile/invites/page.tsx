import InvitesPageClient from "./page.client"
import { getPageMetadata } from "@/lib/metadata"










export function generateMetadata() {
    return getPageMetadata("profileInvites", false)
}

export default function Page() {

    return (
        <InvitesPageClient/>
    )
}
