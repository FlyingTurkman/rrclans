"use server"

import { cookies } from "next/headers"
import { isLocale, LOCALE_COOKIE } from "./config"

// Saves the selected language in a cookie. Call from a client component,
// then refresh the page (router.refresh()) to re-render with the new language.
export async function setLocale(locale: string) {
    if (!isLocale(locale)) return

    const store = await cookies()

    store.set(LOCALE_COOKIE, locale, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
        sameSite: "lax",
    })
}
