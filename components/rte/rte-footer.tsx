"use client"

import type { ComponentProps } from "react"
import { cn } from "@/lib/utils"

export type RTEFooterProps = ComponentProps<"div">

function RTEFooter({ className, ...props }: RTEFooterProps) {
  return (
    <div
      data-slot="rte-footer"
      className={cn(
        "flex flex-wrap items-center gap-1 border-t border-border pt-2 text-xs text-muted-foreground",
        className,
      )}
      {...props}
    />
  )
}

export { RTEFooter }
