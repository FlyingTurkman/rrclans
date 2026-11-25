import type { ReactNode } from "react"
import ProfileLayoutClient from "./layout.client"










export default function Layout({ children }: Readonly<{ children: ReactNode }>) {

    return (
        <ProfileLayoutClient>
            {children}
        </ProfileLayoutClient>
    )
}
