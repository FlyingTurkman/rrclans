import NotificationsPageClient from "./page.client"
import { getPageMetadata } from "@/lib/metadata"










export function generateMetadata() {
    return getPageMetadata("notifications", false)
}

export default function Page() {

    return (
        <NotificationsPageClient/>
    )
}
