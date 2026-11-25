"use client"

import type { ComponentProps } from "react"
import { Undo2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRTE } from "./use-rte"

export type RTEUndoProps = Omit<ComponentProps<typeof Button>, "onClick" | "disabled">

function RTEUndo({ variant = "outline", size = "sm", className, ...props }: RTEUndoProps) {
  const { undo, canUndo } = useRTE()

  return (
    <Button
      data-slot="rte-undo"
      type="button"
      variant={variant}
      size={size}
      aria-label="Undo"
      disabled={!canUndo}
      onClick={undo}
      className={className}
      {...props}
    >
      <Undo2 className="size-4" />
    </Button>
  )
}

export { RTEUndo }
