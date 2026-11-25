import PlayersPageClient from "./page.client"
import { getPageMetadata } from "@/lib/metadata"










export function generateMetadata() {
    return getPageMetadata("players")
}

export default function Page() {

    return (
        <PlayersPageClient/>
    )
}
