import ProfilePageClient from "./page.client"
import { getPageMetadata } from "@/lib/metadata"










export function generateMetadata() {
    return getPageMetadata("profile", false)
}

export default function Page() {

    return (
        <ProfilePageClient/>
    )
}
