import type { User, UserRole } from "@/types"









// Shown instead of the password. The hash itself is never copied.
export const PASSWORD_MASK = "***"

// "sharkman@gmail.com" -> "s***@gmail.com"
export function maskEmail(email: string): string {
    const [local, domain] = email.split("@")

    if (!local || !domain) return PASSWORD_MASK

    return `${local[0]}***@${domain}`
}

// Account data of a user. Relations (refreshTokens, clanMemberships) are
// never copied. Email is masked and password is always "***".
export class UserDto {
    id: string
    username: string
    name: string
    surname: string
    fullname: string
    email: string
    password: string
    role: UserRole
    steamId: string | null
    steamUsername: string | null
    avatar: string | null
    createdAt: Date
    updatedAt: Date

    constructor(data: Omit<User, "password">) {
        this.id = data.id
        this.username = data.username
        this.name = data.name
        this.surname = data.surname
        this.fullname = data.fullname
        this.email = maskEmail(data.email)
        this.password = PASSWORD_MASK
        this.role = data.role
        this.steamId = data.steamId ?? null
        this.steamUsername = data.steamUsername ?? null
        this.avatar = data.avatar ?? null
        this.createdAt = data.createdAt
        this.updatedAt = data.updatedAt
    }
}

// Public data of a user, safe to show to other visitors (player lists,
// profiles). No email, password or relations.
export class PublicUserDto {
    id: string
    username: string
    fullname: string
    steamUsername: string | null
    avatar: string | null
    createdAt: Date

    constructor(data: Omit<User, "password">) {
        this.id = data.id
        this.username = data.username
        this.fullname = data.fullname
        this.steamUsername = data.steamUsername ?? null
        this.avatar = data.avatar ?? null
        this.createdAt = data.createdAt
    }
}
