import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"









type ClanAvatarProps = {
    clanName: string
    avatar?: string | null
    size?: "default" | "sm" | "lg"
    className?: string
}

// Clan avatar. Shows the avatar image if there is one, otherwise (or while it
// loads / if it fails) the first letter of the clan name.
export default function ClanAvatar({ clanName, avatar, size = "default", className }: ClanAvatarProps) {

    return (
        <Avatar
        size={size}
        className={className}
        >
            {avatar && (
                <AvatarImage
                src={avatar}
                alt={clanName}
                />
            )}
            <AvatarFallback className="font-semibold uppercase">
                {clanName.charAt(0)}
            </AvatarFallback>
        </Avatar>
    )
}
