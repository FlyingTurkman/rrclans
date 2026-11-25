import LoginPageClient from "./page.client"
import { getPageMetadata } from "@/lib/metadata"










export function generateMetadata() {
    return getPageMetadata("login")
}

export default function Page() {

    return (
        <LoginPageClient/>
    )
}