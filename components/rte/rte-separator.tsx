"use client"

import type { ComponentProps } from "react"
import { Separator } from "@/components/ui/separator"

export type RTESeparatorProps = ComponentProps<typeof Separator>

function RTESeparator({ orientation = "vertical", ...props }: RTESeparatorProps) {
  return <Separator data-slot="rte-separator" orientation={orientation} {...props} />
}

export { RTESeparator }
