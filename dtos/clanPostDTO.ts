import type { RTEDocument } from "@/components/rte/rte-engine"
import { PublicUserDto } from "@/dtos/userDTO"
import type { ClanPost, PostVisibility, User } from "@/types"









type ClanPostPermissions = {
    canEdit: boolean
    canDelete: boolean
}

// Post on the wall of a clan, with what the current user may do with it.
export class ClanPostDto {
    id: string
    title: string
    visibility: PostVisibility
    // HTML rendered on the server from a validated editor document.
    content: string
    // Editor document, only for users who can edit the post.
    rawContent: RTEDocument | null
    author: PublicUserDto
    canEdit: boolean
    canDelete: boolean
    createdAt: Date

    constructor(data: ClanPost & { author: Omit<User, "password"> }, permissions: ClanPostPermissions) {
        this.id = data.id
        this.title = data.title
        this.visibility = data.visibility
        this.content = data.content
        this.rawContent = permissions.canEdit ? data.rawContent as RTEDocument : null
        this.author = { ...new PublicUserDto(data.author) }
        this.canEdit = permissions.canEdit
        this.canDelete = permissions.canDelete
        this.createdAt = data.createdAt
    }
}
