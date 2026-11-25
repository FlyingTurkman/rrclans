"use client"

import {
  useEffect,
  useLayoutEffect,
  useRef,
  type ComponentProps,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from "react"
import { cn } from "@/lib/utils"
import { useRTE } from "./use-rte"
import {
  applyStyleToRange,
  getGlobalSelectionOffsets,
  getOffsetFromPoint,
  groupRunsIntoLines,
  insertLineBreak,
  setGlobalSelectionOffsets,
  spliceText,
  type RTERun,
} from "./rte-engine"

function runToStyle(run: RTERun): CSSProperties {
  const textDecorationLine = run.format
    .filter(mark => mark === "underline" || mark === "strikethrough" || mark === "overline")
    .map(mark => (mark === "strikethrough" ? "line-through" : mark))
    .join(" ")

  return {
    fontFamily: run.fontFamily,
    fontSize: run.fontSize,
    color: run.color,
    backgroundColor: run.markerColor,
    fontWeight: run.format.includes("bold") ? "bold" : undefined,
    fontStyle: run.format.includes("italic") ? "italic" : undefined,
    textDecorationLine: textDecorationLine || undefined,
  }
}

function documentLength(runs: RTERun[]) {
  return runs.reduce((total, run) => total + run.text.length, 0)
}

const CLICK_DRAG_THRESHOLD = 4

export type RTEContentProps = Omit<ComponentProps<"div">, "onChange"> & {
  placeholder?: string
}

function RTEContent({ className, placeholder, style, ...props }: RTEContentProps) {
  const {
    document: doc,
    setDocument,
    selection,
    setSelection,
    pendingStyle,
    pendingStyleAnchor,
    setPendingStyleAnchor,
    undo,
    redo,
    maxLength,
  } = useRTE()
  const ref = useRef<HTMLDivElement>(null)
  const pointerDownRef = useRef<{ x: number, y: number } | null>(null)

  useLayoutEffect(() => {
    if (ref.current && selection) {
      setGlobalSelectionOffsets(ref.current, selection.start, selection.end)
    }
  }, [doc, selection])

  useEffect(() => {
    const container = ref.current
    if (!container) return

    const handleBeforeInput = (nativeEvent: InputEvent) => {
      if (nativeEvent.isComposing) return

      const offsets = getGlobalSelectionOffsets(container) ?? {
        start: documentLength(doc.runs),
        end: documentLength(doc.runs),
      }

      let next = doc
      let caretOffset = offsets.start

      switch (nativeEvent.inputType) {
        case "insertText":
        case "insertReplacementText":
        case "insertFromPaste": {
          nativeEvent.preventDefault()
          // Pasted text is in dataTransfer, `data` is null.
          let text = (nativeEvent.data ?? nativeEvent.dataTransfer?.getData("text/plain") ?? "").replace(/\r\n?/g, "\n")
          const selectedLength = offsets.end - offsets.start
          if (maxLength !== undefined) {
            const available = maxLength - (documentLength(doc.runs) - selectedLength)
            if (available <= 0 && selectedLength === 0) return
            text = text.slice(0, Math.max(0, available))
          }
          next = spliceText(doc, offsets.start, selectedLength, text)
          caretOffset = offsets.start + text.length
          if (pendingStyle && pendingStyleAnchor === offsets.start && text) {
            next = applyStyleToRange(next, offsets.start, caretOffset, pendingStyle)
            setPendingStyleAnchor(caretOffset)
          }
          break
        }
        case "insertParagraph":
        case "insertLineBreak": {
          nativeEvent.preventDefault()
          const result = insertLineBreak(doc, offsets.start, offsets.end)
          if (maxLength !== undefined && documentLength(result.document.runs) > maxLength) return
          next = result.document
          caretOffset = result.caretOffset
          break
        }
        case "deleteContentBackward": {
          nativeEvent.preventDefault()
          if (offsets.start === offsets.end) {
            const deleteStart = Math.max(0, offsets.start - 1)
            next = spliceText(doc, deleteStart, offsets.start - deleteStart, "")
            caretOffset = deleteStart
          } else {
            next = spliceText(doc, offsets.start, offsets.end - offsets.start, "")
            caretOffset = offsets.start
          }
          break
        }
        case "deleteContentForward": {
          nativeEvent.preventDefault()
          if (offsets.start === offsets.end) {
            const deleteEnd = Math.min(documentLength(doc.runs), offsets.start + 1)
            next = spliceText(doc, offsets.start, deleteEnd - offsets.start, "")
          } else {
            next = spliceText(doc, offsets.start, offsets.end - offsets.start, "")
          }
          caretOffset = offsets.start
          break
        }
        case "historyUndo": {
          nativeEvent.preventDefault()
          undo()
          return
        }
        case "historyRedo": {
          nativeEvent.preventDefault()
          redo()
          return
        }
        default:
          nativeEvent.preventDefault()
          return
      }

      setSelection({ start: caretOffset, end: caretOffset })
      setDocument(next)
    }

    container.addEventListener("beforeinput", handleBeforeInput)
    return () => container.removeEventListener("beforeinput", handleBeforeInput)
  }, [
    doc,
    setDocument,
    setSelection,
    pendingStyle,
    pendingStyleAnchor,
    setPendingStyleAnchor,
    undo,
    redo,
    maxLength,
  ])

  const handleSelect = () => {
    const container = ref.current
    if (!container) return
    setSelection(getGlobalSelectionOffsets(container))
  }

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const isMod = event.ctrlKey || event.metaKey
    if (!isMod) return

    const key = event.key.toLowerCase()

    if (key === "z" && event.shiftKey) {
      event.preventDefault()
      redo()
    } else if (key === "z") {
      event.preventDefault()
      undo()
    } else if (key === "y") {
      event.preventDefault()
      redo()
    }
  }

  const handleMouseDown = (event: ReactMouseEvent<HTMLDivElement>) => {
    pointerDownRef.current = { x: event.clientX, y: event.clientY }
  }

  const handleMouseUp = (event: ReactMouseEvent<HTMLDivElement>) => {
    const container = ref.current
    const down = pointerDownRef.current
    pointerDownRef.current = null
    if (!container) return

    const distance = down
      ? Math.hypot(event.clientX - down.x, event.clientY - down.y)
      : Infinity
    const isSingleClick = event.detail <= 1

    if (isSingleClick && distance < CLICK_DRAG_THRESHOLD) {
      const offset = getOffsetFromPoint(container, event.clientX, event.clientY)
      if (offset !== null) {
        setGlobalSelectionOffsets(container, offset, offset)
        setSelection({ start: offset, end: offset })
        return
      }
    }

    setSelection(getGlobalSelectionOffsets(container))
  }

  const lines = groupRunsIntoLines(doc.runs)
  const endsWithNewline = doc.runs[doc.runs.length - 1]?.text === "\n"

  return (
    <div
      ref={ref}
      data-slot="rte-content"
      contentEditable
      suppressContentEditableWarning
      onSelect={handleSelect}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onKeyDown={handleKeyDown}
      onKeyUp={handleSelect}
      data-placeholder={placeholder}
      style={style}
      className={cn(
        "min-h-32 whitespace-pre-wrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 empty:before:text-muted-foreground empty:before:content-[attr(data-placeholder)]",
        className,
      )}
      {...props}
    >
      {lines.map((line, index) => {
        const isLastLine = index === lines.length - 1
        const showCaretAnchor = isLastLine && endsWithNewline

        return (
          <div key={line.breakRunId ?? line.runs[0]?.id ?? "rte-last-line"} style={{ textAlign: line.align }}>
            {line.runs.map(
              run =>
                run.text && (
                  <span key={run.id} data-run-id={run.id} style={runToStyle(run)}>
                    {run.text}
                  </span>
                ),
            )}
            {line.breakRunId && <br data-run-id={line.breakRunId} />}
            {showCaretAnchor && <span data-rte-caret-anchor="true">{"​"}</span>}
          </div>
        )
      })}
    </div>
  )
}

export { RTEContent }
