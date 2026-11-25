import RegisterPageClient from "./page.client"
import { getPageMetadata } from "@/lib/metadata"










export function generateMetadata() {
    return getPageMetadata("register")
}

export default function Page() {

    return (
        <RegisterPageClient/>
    )
}