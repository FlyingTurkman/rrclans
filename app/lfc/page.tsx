import LfcPageClient from "./page.client"
import { getPageMetadata } from "@/lib/metadata"










export function generateMetadata() {
    return getPageMetadata("lfc")
}

export default function Page() {

    return (
        <LfcPageClient/>
    )
}
