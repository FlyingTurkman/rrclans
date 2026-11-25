import ServerPageClient from "./page.client"
import { getPageMetadata } from "@/lib/metadata"










export function generateMetadata() {
    return getPageMetadata("profileServer", false)
}

export default function Page() {

    return (
        <ServerPageClient/>
    )
}
