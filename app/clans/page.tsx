import ClansPageClient from "./page.client"
import { getPageMetadata } from "@/lib/metadata"










export function generateMetadata() {
    return getPageMetadata("clans")
}

export default function Page() {

    return (
        <ClansPageClient/>
    )
}
