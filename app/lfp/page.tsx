import LfpPageClient from "./page.client"
import { getPageMetadata } from "@/lib/metadata"










export function generateMetadata() {
    return getPageMetadata("lfp")
}

export default function Page() {

    return (
        <LfpPageClient/>
    )
}
