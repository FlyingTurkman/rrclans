'use client'

import { useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { IoChevronDown, IoLogOutOutline, IoPersonOutline } from "react-icons/io5"
import { logout } from "@/actions/auth/logout"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Spinner } from "@/components/ui/spinner"
import UserAvatar from "@/components/user/UserAvatar"
import { useSiteContext } from "@/context/SiteContext"









// Right side of the main menu: a spinner while the user is loading,
// a profile menu when logged in, otherwise register / login links.
export default function MainMenuAuth() {
    const t = useTranslations("MainMenu")
    const { user, setUser, isUserLoading } = useSiteContext()
    const router = useRouter()
    const [isLoggingOut, startLogout] = useTransition()

    function handleLogout() {
        startLogout(async () => {
            await logout()
            setUser(null)
            router.refresh()
        })
    }

    if (isUserLoading) {
        return (
            <div className="flex items-center">
                <Spinner className="size-5" aria-label={t("loading")}/>
            </div>
        )
    }

    if (user) {
        return (
            <div className="flex items-center">
                <DropdownMenu>
                    <DropdownMenuTrigger
                    className="flex items-center gap-2 font-medium outline-none"
                    >
                        <UserAvatar
                        username={user.username}
                        avatar={user.avatar}
                        size="sm"
                        />
                        {user.username} <IoChevronDown/>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                    align="end"
                    className="w-48"
                    >
                        <DropdownMenuGroup>
                            <DropdownMenuLabel>
                                {user.fullname}
                            </DropdownMenuLabel>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator/>
                        <DropdownMenuItem
                        render={<Link href="/profile"/>}
                        >
                            <IoPersonOutline/>
                            {t('profile')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                        variant="destructive"
                        disabled={isLoggingOut}
                        onClick={handleLogout}
                        >
                            {isLoggingOut ? <Spinner/> : <IoLogOutOutline/>}
                            {t('logout')}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        )
    }

    return (
        <ul
        className="flex items-center gap-4"
        >
            <li>
                <Link
                href={'/auth/register'}
                >
                    {t('register')}
                </Link>
            </li>
            <li>
                <Link
                href={'/auth/login'}
                >
                    {t('login')}
                </Link>
            </li>
        </ul>
    )
}
