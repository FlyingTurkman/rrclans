import { cn } from "@/lib/utils"









type RichTextContentProps = {
    // HTML rendered on the server by serializeToHtml from a validated document.
    // Never pass HTML from any other source.
    html: string
    className?: string
}

// Read-only view of text written with RichTextEditor.
export default function RichTextContent({ html, className }: RichTextContentProps) {

    return (
        <div
        className={cn("text-sm break-words whitespace-pre-wrap", className)}
        dangerouslySetInnerHTML={{ __html: html }}
        />
    )
}
