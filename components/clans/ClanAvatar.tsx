import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getClanAvatarSrc } from "@/lib/src/clanAvatars"









type ClanAvatarProps = {
    clanName: string
    // Id of a ready-made avatar (lib/src/clanAvatars.ts).
    avatar?: string | null
    size?: "default" | "sm" | "lg"
    className?: string
}

// Clan avatar. Shows the avatar image if there is one, otherwise (or while it
// loads / if it fails) the first letter of the clan name.
export default function ClanAvatar({ clanName, avatar, size = "default", className }: ClanAvatarProps) {
    const src = getClanAvatarSrc(avatar)

    return (
        <Avatar
        size={size}
        className={className}
        >
            {src && (
                <AvatarImage
                src={src}
                alt={clanName}
                />
            )}
            <AvatarFallback className="font-semibold uppercase">
                {clanName.charAt(0)}
            </AvatarFallback>
        </Avatar>
    )
}
