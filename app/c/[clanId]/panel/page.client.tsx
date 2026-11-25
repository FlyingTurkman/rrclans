'use client'

import ClanAvatarPicker from "@/components/clans/ClanAvatarPicker"
import ClanInfoForm from "@/components/clans/ClanInfoForm"
import { useClanContext } from "@/context/ClanContext"
import { canChangeAvatar } from "@/lib/src/clanPermissions"









// First page of the panel: clan information. Access is checked in the layout.
export default function PanelPageClient() {
    const { viewerRole } = useClanContext()

    return (
        <div className="flex flex-col gap-6">
            {canChangeAvatar(viewerRole) && <ClanAvatarPicker/>}
            <ClanInfoForm/>
        </div>
    )
}
