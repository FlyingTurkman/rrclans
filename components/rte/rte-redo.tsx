"use client"

import type { ComponentProps } from "react"
import { Redo2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRTE } from "./use-rte"

export type RTERedoProps = Omit<ComponentProps<typeof Button>, "onClick" | "disabled">

function RTERedo({ variant = "outline", size = "sm", className, ...props }: RTERedoProps) {
  const { redo, canRedo } = useRTE()

  return (
    <Button
      data-slot="rte-redo"
      type="button"
      variant={variant}
      size={size}
      aria-label="Redo"
      disabled={!canRedo}
      onClick={redo}
      className={className}
      {...props}
    >
      <Redo2 className="size-4" />
    </Button>
  )
}

export { RTERedo }
