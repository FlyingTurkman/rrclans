import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"









type UserAvatarProps = {
    username: string
    avatar?: string | null
    size?: "default" | "sm" | "lg"
    className?: string
}

// User avatar. Shows the avatar image if there is one, otherwise (or while it
// loads / if it fails) the first letter of the username.
export default function UserAvatar({ username, avatar, size = "default", className }: UserAvatarProps) {

    return (
        <Avatar
        size={size}
        className={className}
        >
            {avatar && (
                <AvatarImage
                src={avatar}
                alt={username}
                />
            )}
            <AvatarFallback
            className="font-semibold uppercase"
            >
                {username.charAt(0)}
            </AvatarFallback>
        </Avatar>
    )
}
