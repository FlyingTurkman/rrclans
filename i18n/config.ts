// Supported languages. Add a new locale here and create messages/<locale>.json.
export const locales = ["en", "tr"] as const

export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = "en"

// Cookie that stores the user's selected language.
export const LOCALE_COOKIE = "NEXT_LOCALE"

export function isLocale(value: unknown): value is Locale {
    return typeof value === "string" && (locales as readonly string[]).includes(value)
}
