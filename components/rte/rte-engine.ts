export type RTETextAlign = "left" | "center" | "right" | "justify"

export type RTERun = {
  id: string
  text: string
  fontFamily: string
  fontSize: string
  color: string
  markerColor: string
  format: string[]
  align: RTETextAlign
}

export type RTEDocument = {
  runs: RTERun[]
}

export type RTERunStyle = Pick<RTERun, "fontFamily" | "fontSize" | "color" | "markerColor" | "format">

export type RTESelectionRange = {
  start: number
  end: number
}

let idCounter = 0

export function createRunId() {
  idCounter += 1
  return `run-${idCounter}-${Math.random().toString(36).slice(2, 8)}`
}

export function createEmptyDocument(
  id: string,
  fontFamily = "inherit",
  fontSize = "inherit",
  color = "inherit",
  markerColor = "transparent",
  align: RTETextAlign = "left",
): RTEDocument {
  return { runs: [{ id, text: "", fontFamily, fontSize, color, markerColor, format: [], align }] }
}

function mergeAdjacentRuns(runs: RTERun[]): RTERun[] {
  const merged: RTERun[] = []

  for (const run of runs) {
    const previous = merged[merged.length - 1]
    const sameStyle =
      previous &&
      !previous.text.includes("\n") &&
      !run.text.includes("\n") &&
      previous.fontFamily === run.fontFamily &&
      previous.fontSize === run.fontSize &&
      previous.color === run.color &&
      previous.markerColor === run.markerColor &&
      previous.align === run.align &&
      previous.format.length === run.format.length &&
      previous.format.every(mark => run.format.includes(mark))

    if (previous && sameStyle) {
      previous.text += run.text
    } else {
      merged.push({ ...run })
    }
  }

  return merged
}

function normalizeRuns(runs: RTERun[], fallback: RTERun): RTERun[] {
  const nonEmpty = runs.filter(run => run.text.length > 0)
  const base = nonEmpty.length > 0 ? nonEmpty : [{ ...fallback, id: createRunId(), text: "" }]
  return mergeAdjacentRuns(base)
}

function runAt(runs: RTERun[], offset: number) {
  let cursor = 0

  for (const run of runs) {
    const start = cursor
    const end = cursor + run.text.length
    if (offset >= start && offset <= end) {
      return { run, start, end }
    }
    cursor = end
  }

  const last = runs[runs.length - 1]
  return last ? { run: last, start: cursor - last.text.length, end: cursor } : null
}

const FALLBACK_RUN: RTERun = {
  id: "",
  text: "",
  fontFamily: "inherit",
  fontSize: "inherit",
  color: "inherit",
  markerColor: "transparent",
  format: [],
  align: "left",
}

export function spliceText(
  document: RTEDocument,
  at: number,
  deleteCount: number,
  insertText: string,
): RTEDocument {
  const runs = document.runs
  const result: RTERun[] = []
  const deleteEnd = at + deleteCount
  let cursor = 0
  let inserted = false

  for (const run of runs) {
    const runStart = cursor
    const runEnd = cursor + run.text.length
    cursor = runEnd

    const touchesDelete = deleteEnd > runStart && at < runEnd
    const isInsertPoint = !inserted && at >= runStart && at <= runEnd

    if (!touchesDelete && !isInsertPoint) {
      result.push(run)
      continue
    }

    const before = run.text.slice(0, Math.max(0, Math.min(run.text.length, at - runStart)))
    const after = run.text.slice(Math.max(0, Math.min(run.text.length, deleteEnd - runStart)))
    const beforeIsFullRun = before.length === run.text.length

    if (before) result.push({ ...run, id: beforeIsFullRun ? run.id : createRunId(), text: before })
    if (isInsertPoint && insertText) {
      result.push({ ...run, id: createRunId(), text: insertText })
      inserted = true
    }
    if (after) result.push({ ...run, id: createRunId(), text: after })
  }

  if (!inserted && insertText) {
    const last = runs[runs.length - 1]
    result.push({
      id: createRunId(),
      text: insertText,
      fontFamily: last?.fontFamily ?? "inherit",
      fontSize: last?.fontSize ?? "inherit",
      color: last?.color ?? "inherit",
      markerColor: last?.markerColor ?? "transparent",
      format: last?.format ?? [],
      align: last?.align ?? "left",
    })
  }

  const fallback = runs[runs.length - 1] ?? FALLBACK_RUN
  return { runs: normalizeRuns(result, fallback) }
}

export function applyStyleToRange(
  document: RTEDocument,
  rangeStart: number,
  rangeEnd: number,
  patch: Partial<RTERunStyle>,
): RTEDocument {
  const runs = document.runs
  let start = rangeStart
  let end = rangeEnd

  if (start === end) {
    const target = runAt(runs, start)
    if (!target) return document
    start = target.start
    end = target.end
  }

  const result: RTERun[] = []
  let cursor = 0

  for (const run of runs) {
    const runStart = cursor
    const runEnd = cursor + run.text.length
    cursor = runEnd

    const overlapStart = Math.max(runStart, start)
    const overlapEnd = Math.min(runEnd, end)

    if (overlapStart >= overlapEnd) {
      result.push(run)
      continue
    }

    const before = run.text.slice(0, overlapStart - runStart)
    const middle = run.text.slice(overlapStart - runStart, overlapEnd - runStart)
    const after = run.text.slice(overlapEnd - runStart)

    if (before) result.push({ ...run, id: createRunId(), text: before })
    result.push({ ...run, ...patch, id: createRunId(), text: middle })
    if (after) result.push({ ...run, id: createRunId(), text: after })
  }

  const fallback = runs[0] ?? FALLBACK_RUN
  return { runs: normalizeRuns(result, fallback) }
}

export function getActiveStyle(document: RTEDocument, start: number, end: number) {
  const runs = document.runs
  let touched: RTERun[] = []

  if (start === end) {
    const target = runAt(runs, start)
    touched = target ? [target.run] : []
  } else {
    let cursor = 0
    for (const run of runs) {
      const runStart = cursor
      const runEnd = cursor + run.text.length
      cursor = runEnd
      if (Math.max(runStart, start) < Math.min(runEnd, end)) {
        touched.push(run)
      }
    }
  }

  if (touched.length === 0) {
    return {
      fontFamily: "inherit",
      fontSize: "inherit",
      color: "inherit",
      markerColor: "transparent",
      format: [] as string[],
    }
  }

  const fontFamily = touched.every(run => run.fontFamily === touched[0].fontFamily)
    ? touched[0].fontFamily
    : "inherit"

  const fontSize = touched.every(run => run.fontSize === touched[0].fontSize)
    ? touched[0].fontSize
    : "inherit"

  const color = touched.every(run => run.color === touched[0].color) ? touched[0].color : "inherit"

  const markerColor = touched.every(run => run.markerColor === touched[0].markerColor)
    ? touched[0].markerColor
    : "transparent"

  const format = touched[0].format.filter(mark => touched.every(run => run.format.includes(mark)))

  return { fontFamily, fontSize, color, markerColor, format }
}

export type RTELineListType = "none" | "bullet" | "number"

const BULLET_PREFIX = "• "
const NUMBER_PATTERN = /^\d+\. /

function documentText(document: RTEDocument) {
  return document.runs.map(run => run.text).join("")
}

function getLineBounds(document: RTEDocument, offset: number): RTESelectionRange {
  const text = documentText(document)
  const start = text.lastIndexOf("\n", offset - 1) + 1
  const nextBreak = text.indexOf("\n", offset)
  const end = nextBreak === -1 ? text.length : nextBreak
  return { start, end }
}

function getLinePrefixInfo(lineText: string): { type: RTELineListType, length: number } {
  if (lineText.startsWith(BULLET_PREFIX)) {
    return { type: "bullet", length: BULLET_PREFIX.length }
  }
  const match = lineText.match(NUMBER_PATTERN)
  if (match) {
    return { type: "number", length: match[0].length }
  }
  return { type: "none", length: 0 }
}

function countPrecedingNumberedLines(document: RTEDocument, lineStart: number): number {
  const text = documentText(document)
  let count = 0
  let searchEnd = lineStart - 1

  while (searchEnd >= 0) {
    const prevLineStart = text.lastIndexOf("\n", searchEnd - 1) + 1
    const prevLineText = text.slice(prevLineStart, searchEnd)
    if (getLinePrefixInfo(prevLineText).type !== "number") break
    count += 1
    searchEnd = prevLineStart - 1
  }

  return count
}

export function getLineListType(document: RTEDocument, offset: number): RTELineListType {
  const { start, end } = getLineBounds(document, offset)
  return getLinePrefixInfo(documentText(document).slice(start, end)).type
}

export function setLineListType(
  document: RTEDocument,
  offset: number,
  type: RTELineListType,
): { document: RTEDocument, offsetDelta: number } {
  const bounds = getLineBounds(document, offset)
  const lineText = documentText(document).slice(bounds.start, bounds.end)
  const current = getLinePrefixInfo(lineText)

  const withoutPrefix =
    current.type === "none" ? document : spliceText(document, bounds.start, current.length, "")

  if (type === "none" || current.type === type) {
    return { document: withoutPrefix, offsetDelta: -current.length }
  }

  const newPrefix =
    type === "bullet" ? BULLET_PREFIX : `${countPrecedingNumberedLines(document, bounds.start) + 1}. `

  return {
    document: spliceText(withoutPrefix, bounds.start, 0, newPrefix),
    offsetDelta: newPrefix.length - current.length,
  }
}

export function insertLineBreak(
  document: RTEDocument,
  start: number,
  end: number,
): { document: RTEDocument, caretOffset: number } {
  const bounds = getLineBounds(document, start)
  const lineText = documentText(document).slice(bounds.start, bounds.end)
  const current = getLinePrefixInfo(lineText)
  const isEmptyListLine = current.type !== "none" && lineText.length === current.length && start === end

  if (isEmptyListLine) {
    return {
      document: spliceText(document, bounds.start, current.length, ""),
      caretOffset: bounds.start,
    }
  }

  const withBreak = spliceText(document, start, end - start, "\n")

  if (current.type === "none") {
    return { document: withBreak, caretOffset: start + 1 }
  }

  const nextPrefix =
    current.type === "bullet"
      ? BULLET_PREFIX
      : `${countPrecedingNumberedLines(document, bounds.start) + 2}. `

  return {
    document: spliceText(withBreak, start + 1, 0, nextPrefix),
    caretOffset: start + 1 + nextPrefix.length,
  }
}

export function getLineAlign(document: RTEDocument, offset: number): RTETextAlign {
  const bounds = getLineBounds(document, offset)
  let cursor = 0

  for (const run of document.runs) {
    const runStart = cursor
    const runEnd = cursor + run.text.length
    cursor = runEnd

    if (run.text === "\n") {
      if (runStart === bounds.start && bounds.start === bounds.end) return run.align
      continue
    }

    if (Math.max(runStart, bounds.start) < Math.min(runEnd, bounds.end)) {
      return run.align
    }
  }

  return "left"
}

export function setLineAlign(
  document: RTEDocument,
  selectionStart: number,
  selectionEnd: number,
  align: RTETextAlign,
): RTEDocument {
  const from = getLineBounds(document, selectionStart).start
  const to = getLineBounds(document, selectionEnd).end
  const runs = document.runs

  if (from === to) {
    let cursor = 0
    for (const run of runs) {
      const runStart = cursor
      cursor += run.text.length
      if (runStart === from && run.text === "\n") {
        return { runs: runs.map(candidate => (candidate === run ? { ...candidate, align } : candidate)) }
      }
    }
    return document
  }

  const result: RTERun[] = []
  let cursor = 0

  for (const run of runs) {
    const runStart = cursor
    const runEnd = cursor + run.text.length
    cursor = runEnd

    const overlapStart = Math.max(runStart, from)
    const overlapEnd = Math.min(runEnd, to)

    if (overlapStart >= overlapEnd || run.text === "\n") {
      result.push(run)
      continue
    }

    const before = run.text.slice(0, overlapStart - runStart)
    const middle = run.text.slice(overlapStart - runStart, overlapEnd - runStart)
    const after = run.text.slice(overlapEnd - runStart)

    if (before) result.push({ ...run, id: createRunId(), text: before })
    result.push({ ...run, align, id: createRunId(), text: middle })
    if (after) result.push({ ...run, id: createRunId(), text: after })
  }

  const fallback = runs[0] ?? FALLBACK_RUN
  return { runs: normalizeRuns(result, fallback) }
}

export type RTELine = {
  runs: RTERun[]
  align: RTETextAlign
  breakRunId: string | null
}

export function groupRunsIntoLines(runs: RTERun[]): RTELine[] {
  const lines: RTELine[] = []
  let current: RTERun[] = []

  for (const run of runs) {
    if (run.text === "\n") {
      lines.push({ runs: current, align: current[0]?.align ?? run.align, breakRunId: run.id })
      current = []
    } else {
      current.push(run)
    }
  }

  lines.push({ runs: current, align: current[0]?.align ?? "left", breakRunId: null })

  return lines
}

export function serializeToPlainText(document: RTEDocument): string {
  return documentText(document)
}

export function serializeToJson(document: RTEDocument): string {
  return JSON.stringify(document, null, 2)
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function runToHtml(run: RTERun): string {
  let html = escapeHtml(run.text)
  if (run.format.includes("bold")) html = `<strong>${html}</strong>`
  if (run.format.includes("italic")) html = `<em>${html}</em>`
  if (run.format.includes("underline")) html = `<u>${html}</u>`
  if (run.format.includes("strikethrough")) html = `<s>${html}</s>`

  const styles: string[] = []
  if (run.fontFamily !== "inherit") styles.push(`font-family: ${run.fontFamily}`)
  if (run.fontSize !== "inherit") styles.push(`font-size: ${run.fontSize}`)
  if (run.color !== "inherit") styles.push(`color: ${run.color}`)
  if (run.markerColor !== "transparent") styles.push(`background-color: ${run.markerColor}`)
  if (run.format.includes("overline")) styles.push("text-decoration: overline")

  return styles.length > 0 ? `<span style="${styles.join("; ")}">${html}</span>` : html
}

export function serializeToHtml(document: RTEDocument): string {
  return groupRunsIntoLines(document.runs)
    .map(line => {
      const inner = line.runs.map(runToHtml).join("")
      return `<div style="text-align: ${line.align}">${inner || "<br />"}</div>`
    })
    .join("")
}

function isBrElement(node: Node): boolean {
  return node.nodeType === Node.ELEMENT_NODE && (node as Element).tagName === "BR"
}

function isCaretAnchor(node: Node): boolean {
  return node.nodeType === Node.ELEMENT_NODE && (node as Element).hasAttribute("data-rte-caret-anchor")
}

function isWithinCaretAnchor(node: Node): boolean {
  const element = node.nodeType === Node.ELEMENT_NODE ? (node as Element) : node.parentElement
  return element ? element.closest("[data-rte-caret-anchor]") !== null : false
}

function unitLength(node: Node): number {
  if (isWithinCaretAnchor(node)) return 0
  if (node.nodeType === Node.TEXT_NODE) return (node as Text).data.length
  if (isBrElement(node)) return 1

  let sum = 0
  node.childNodes.forEach(child => {
    sum += unitLength(child)
  })
  return sum
}

function textOffsetOf(container: HTMLElement, node: Node, offset: number): number {
  let total: number

  if (node.nodeType === Node.TEXT_NODE) {
    total = isWithinCaretAnchor(node) ? 0 : offset
  } else {
    total = 0
    for (const child of Array.from(node.childNodes).slice(0, offset)) {
      total += unitLength(child)
    }
  }

  let current: Node = node
  while (current !== container) {
    const parent: Node | null = current.parentNode
    if (!parent) break
    let sibling = current.previousSibling
    while (sibling) {
      total += unitLength(sibling)
      sibling = sibling.previousSibling
    }
    current = parent
  }

  return total
}

export function getGlobalSelectionOffsets(container: HTMLElement): RTESelectionRange | null {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return null

  const range = selection.getRangeAt(0)
  if (!container.contains(range.startContainer) || !container.contains(range.endContainer)) {
    return null
  }

  const start = textOffsetOf(container, range.startContainer, range.startOffset)
  const end = textOffsetOf(container, range.endContainer, range.endOffset)
  return { start: Math.min(start, end), end: Math.max(start, end) }
}

function locateWithinLine(root: Node, offset: number): { node: Node, offset: number } {
  const children = Array.from(root.childNodes)
  let consumed = 0

  for (let index = 0; index < children.length; index++) {
    const child = children[index]

    if (isCaretAnchor(child)) {
      if (child.firstChild) return { node: child.firstChild, offset: 0 }
      continue
    }

    if (isBrElement(child)) {
      if (offset <= consumed) return { node: root, offset: index }
      consumed += 1
      continue
    }

    const length = unitLength(child)
    const isLastChild = index === children.length - 1

    if (offset < consumed + length || (isLastChild && offset <= consumed + length)) {
      const textNode = child.firstChild as Text | null
      if (textNode) return { node: textNode, offset: offset - consumed }
    }
    consumed += length
  }

  return { node: root, offset: children.length }
}

function locate(container: HTMLElement, offset: number): { node: Node, offset: number } {
  const lines = Array.from(container.childNodes)
  let consumed = 0

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index]
    const length = unitLength(line)
    const isLastLine = index === lines.length - 1

    if (offset < consumed + length || (isLastLine && offset <= consumed + length)) {
      return locateWithinLine(line, offset - consumed)
    }

    consumed += length
  }

  return { node: container, offset: lines.length }
}

type CaretPositionDocument = Document & {
  caretPositionFromPoint?: (x: number, y: number) => { offsetNode: Node, offset: number } | null
  caretRangeFromPoint?: (x: number, y: number) => Range | null
}

export function getOffsetFromPoint(container: HTMLElement, x: number, y: number): number | null {
  const doc = window.document as CaretPositionDocument

  if (doc.caretPositionFromPoint) {
    const position = doc.caretPositionFromPoint(x, y)
    if (!position || !container.contains(position.offsetNode)) return null
    return textOffsetOf(container, position.offsetNode, position.offset)
  }

  if (doc.caretRangeFromPoint) {
    const range = doc.caretRangeFromPoint(x, y)
    if (!range || !container.contains(range.startContainer)) return null
    return textOffsetOf(container, range.startContainer, range.startOffset)
  }

  return null
}

export function setGlobalSelectionOffsets(container: HTMLElement, start: number, end: number) {
  const selection = window.getSelection()
  if (!selection) return

  const range = window.document.createRange()
  const startPoint = locate(container, start)
  const endPoint = locate(container, end)

  range.setStart(startPoint.node, startPoint.offset)
  range.setEnd(endPoint.node, endPoint.offset)
  selection.removeAllRanges()
  selection.addRange(range)
}
