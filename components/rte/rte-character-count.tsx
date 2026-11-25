"use client"

import type { ComponentProps } from "react"
import { useRTE } from "./use-rte"
import { serializeToPlainText } from "./rte-engine"

export type RTECharacterCountProps = ComponentProps<"span">

function RTECharacterCount({ ...props }: RTECharacterCountProps) {
  const { document, maxLength } = useRTE()
  const count = serializeToPlainText(document).length

  return (
    <span data-slot="rte-character-count" {...props}>
      {maxLength !== undefined ? `${count}/${maxLength}` : count}
    </span>
  )
}

export { RTECharacterCount }
