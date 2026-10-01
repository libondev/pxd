import type { Ref, ShallowRef } from 'vue'
import { onBeforeUnmount, shallowRef, watch } from 'vue'
import {
  CARET_ANCHOR,
  createCaretAnchor,
  createMentionElement,
  escapePlainTextAsHtml,
  getMentionLabel,
  isMentionElement,
  queryMentionElements,
  sanitizeMentionClipboardHtml,
  serializeMentionHtml,
  setMentionEditorContent,
} from '../../utils/mention-html.js'

export interface UseMentionEditorOptions {
  editorRef: Ref<HTMLElement | undefined>
  getModelValue: () => string
  isDisabled: () => boolean
  onUpdate: (html: string) => void
  onTrigger: () => void
  onMentionClick: (payload: { key: string; label: string; event: MouseEvent }) => void
}

export interface UseMentionEditorReturn {
  isEmpty: ShallowRef<boolean>
  isComposing: ShallowRef<boolean>
  insertMention: (key: string, label: string) => boolean
  restoreCaret: () => void
  onBeforeInput: (ev: InputEvent) => void
  onInput: () => void
  onKeydown: (ev: KeyboardEvent) => void
  onPaste: (ev: ClipboardEvent) => void
  onClick: (ev: MouseEvent) => void
  onCopyOrCut: (ev: ClipboardEvent) => void
  onCompositionStart: () => void
  onCompositionEnd: () => void
  mount: () => void
}

/**
 * Contenteditable mention editor: HTML sync, @ trigger ranges, insert/delete chips, paste.
 */
export function useMentionEditor({
  editorRef,
  getModelValue,
  isDisabled,
  onUpdate,
  onTrigger,
  onMentionClick,
}: UseMentionEditorOptions): UseMentionEditorReturn {
  const isComposing = shallowRef(false)
  const isEmpty = shallowRef(true)

  let triggerRange: Range | null = null
  let restoreRange: Range | null = null
  let restoreTimer: ReturnType<typeof setTimeout> | null = null
  let lastEmittedHtml = ''
  // Only open suggest when `@` was inserted — not when delete/undo leaves `@` before the caret.
  let pendingAtInsert = false

  function syncEmptyState(html: string) {
    isEmpty.value = html.trim() === ''
  }

  /**
   * Every chip needs an editable text node to its right, otherwise the caret has
   * nowhere representable to sit and Android dismisses the keyboard. The
   * backward-delete path already refuses to eat the anchor, but a wide selection
   * replace or a paste can still take it out, so the invariant is re-asserted
   * after every input rather than guarded path by path.
   */
  function ensureCaretAnchors() {
    const editor = editorRef.value

    if (!editor) {
      return
    }

    // Pressing Enter nests content in block elements, so walk the whole subtree
    // rather than just the editor's direct children.
    for (const node of queryMentionElements(editor)) {
      const next = node.nextSibling

      if (next?.nodeType === Node.TEXT_NODE) {
        const text = next as Text

        if (!text.data.includes(CARET_ANCHOR)) {
          text.data = CARET_ANCHOR + text.data
        }
      } else {
        node.parentNode?.insertBefore(createCaretAnchor(), next ?? null)
      }
    }
  }

  function emitHTML() {
    if (!editorRef.value) {
      return
    }

    const html = serializeMentionHtml(editorRef.value)
    syncEmptyState(html)
    lastEmittedHtml = html
    onUpdate(html)
  }

  function applyHTML(html: string) {
    if (!editorRef.value) {
      return
    }

    // Drop Range → detached-node retention before replacing children.
    clearTriggerRange()
    cancelScheduledRestore()

    setMentionEditorContent(editorRef.value, html)
    const serialized = serializeMentionHtml(editorRef.value)
    syncEmptyState(serialized)
    // Recorded before returning, so the model watcher never re-applies our own write.
    lastEmittedHtml = serialized
  }

  function clearTriggerRange() {
    triggerRange = null
    restoreRange = null
  }

  function cancelScheduledRestore() {
    if (restoreTimer != null) {
      clearTimeout(restoreTimer)
      restoreTimer = null
    }
  }

  function applyRestoreCaret() {
    restoreTimer = null

    if (!editorRef.value) {
      clearTriggerRange()
      return
    }

    const range = restoreRange
    clearTriggerRange()

    editorRef.value.focus({ preventScroll: true })

    if (!range) {
      return
    }

    try {
      if (!editorRef.value.contains(range.startContainer)) {
        return
      }

      const selection = window.getSelection()
      selection?.removeAllRanges()
      selection?.addRange(range)
    } catch {
      // Range may be stale after DOM changes; focus alone is enough.
    }
  }

  /**
   * Restore caret after the popover focus-trap deactivates. Always deferred:
   * focusing while the trap is still active gets pulled back into the popover.
   */
  function restoreCaret() {
    cancelScheduledRestore()

    restoreTimer = setTimeout(() => {
      applyRestoreCaret()
    }, 0)
  }

  function saveTriggerRangeFromSelection() {
    const selection = window.getSelection()

    if (!selection || selection.rangeCount === 0 || !selection.isCollapsed) {
      return false
    }

    const caret = selection.getRangeAt(0)
    const atRange = caret.cloneRange()

    try {
      atRange.setStart(atRange.startContainer, Math.max(0, atRange.startOffset - 1))
    } catch {
      return false
    }

    if (atRange.toString() !== '@') {
      return false
    }

    // Only trigger when `@` is at content start or preceded by whitespace (not mid-word).
    if (!isAtTriggerBoundary(atRange)) {
      return false
    }

    restoreRange = caret.cloneRange()
    triggerRange = atRange
    return true
  }

  /**
   * `@` triggers at content start, after whitespace, or immediately after a mention chip.
   */
  function isAtTriggerBoundary(atRange: Range): boolean {
    const before = boundaryBefore(atRange.startContainer, atRange.startOffset)

    if (before === 'start' || before === 'mention') {
      return true
    }

    return /\s/.test(before) || before === CARET_ANCHOR
  }

  /**
   * What sits immediately before `(container, offset)`:
   * - `'start'` — beginning of the editor
   * - `'mention'` — an `<at>` chip
   * - otherwise the preceding character
   *
   * The editor only ever holds text nodes, `<at>` chips and `<br>`, so stepping
   * back one node is enough — no tree walk needed.
   */
  function boundaryBefore(container: Node, offset: number): string {
    if (container.nodeType === Node.TEXT_NODE) {
      if (offset > 0) {
        return (container.textContent ?? '').charAt(offset - 1)
      }

      container = container.previousSibling as Node
    } else if (container.nodeType === Node.ELEMENT_NODE) {
      container = (
        offset > 0 ? container.childNodes[offset - 1] : container.previousSibling
      ) as Node
    }

    while (container?.nodeType === Node.TEXT_NODE) {
      const text = container.textContent ?? ''

      if (text.length) {
        return text.charAt(text.length - 1)
      }

      container = container.previousSibling as Node
    }

    if (!container) {
      return 'start'
    }

    if (isMentionElement(container)) {
      return 'mention'
    }

    return container.nodeName === 'BR' ? '\n' : 'start'
  }

  function detectTriggerAfterInput() {
    if (isComposing.value || isDisabled() || !pendingAtInsert) {
      return
    }

    pendingAtInsert = false

    if (saveTriggerRangeFromSelection()) {
      onTrigger()
    }
  }

  function notePendingAtInsert(ev: InputEvent) {
    if (
      (ev.inputType === 'insertText' ||
        ev.inputType === 'insertCompositionText' ||
        ev.inputType === 'insertReplacementText') &&
      (ev.data?.includes('@') ?? false)
    ) {
      pendingAtInsert = true
      return
    }

    pendingAtInsert = false
  }

  function isBackwardDeleteInputType(inputType: string): boolean {
    return inputType === 'deleteEntireSoftLine' || inputType.endsWith('Backward')
  }

  function insertMention(key: string, label: string): boolean {
    if (!editorRef.value || isDisabled()) {
      return false
    }

    const range = triggerRange

    if (!range || !editorRef.value.contains(range.startContainer)) {
      return false
    }

    range.deleteContents()

    const mention = createMentionElement(key, label)
    range.insertNode(mention)

    // Keep an editable text node right after the chip so the caret can land there.
    const sibling = mention.nextSibling
    let anchor: Text

    if (sibling?.nodeType === Node.TEXT_NODE) {
      const text = sibling as Text
      text.textContent = CARET_ANCHOR + (text.textContent ?? '')
      anchor = text
    } else {
      anchor = createCaretAnchor()
      mention.parentNode?.insertBefore(anchor, sibling ?? null)
    }

    const caret = document.createRange()
    caret.setStart(anchor, 1)
    caret.collapse(true)

    triggerRange = null
    restoreRange = caret
    emitHTML()
    return true
  }

  function closestMention(node: Node | null | undefined): HTMLElement | null {
    if (!node || !editorRef.value) {
      return null
    }

    if (isMentionElement(node)) {
      return node as HTMLElement
    }

    const el = node.nodeType === Node.ELEMENT_NODE ? (node as Element) : node.parentElement
    const mention = el?.closest?.('at')

    if (!mention || !editorRef.value.contains(mention) || !isMentionElement(mention)) {
      return null
    }

    return mention as HTMLElement
  }

  function retainEditorFocus() {
    editorRef.value?.focus({ preventScroll: true })
  }

  function placeCaret(node: Node, offset: number) {
    const selection = window.getSelection()
    const range = document.createRange()
    range.setStart(node, offset)
    range.collapse(true)
    selection?.removeAllRanges()
    selection?.addRange(range)
  }

  function placeCaretAfter(node: Node) {
    const selection = window.getSelection()
    const range = document.createRange()
    range.setStartAfter(node)
    range.collapse(true)
    selection?.removeAllRanges()
    selection?.addRange(range)
  }

  function deleteMentionElement(mention: HTMLElement) {
    const editor = editorRef.value
    const parent = mention.parentNode

    if (!editor || !parent || !editor.contains(mention)) {
      return
    }

    const before = mention.previousSibling
    // The caret anchor always follows a chip, so `next` is the text node the caret
    // belongs in once the chip is gone.
    const next = mention.nextSibling

    cancelScheduledRestore()
    clearTriggerRange()

    mention.remove()
    retainEditorFocus()

    if (before?.nodeType === Node.TEXT_NODE && editor.contains(before)) {
      placeCaret(before, before.textContent?.length ?? 0)
    } else if (before && editor.contains(before)) {
      placeCaretAfter(before)
    } else if (next && editor.contains(next)) {
      placeCaret(next, 0)
    }

    emitHTML()
  }

  /**
   * Own backward-delete next to / inside mention chips so the browser does not
   * select into `contenteditable=false` text.
   */
  function tryDeleteBackward(): boolean {
    if (!editorRef.value) {
      return false
    }

    const selection = window.getSelection()

    if (!selection || selection.rangeCount === 0) {
      return false
    }

    const range = selection.getRangeAt(0)
    let handled = false

    if (!selection.isCollapsed) {
      const mention =
        closestMention(range.startContainer) ||
        closestMention(range.endContainer) ||
        mentionOwningAnchorDelete(range)

      if (mention) {
        deleteMentionElement(mention)
        handled = true
      }
    } else {
      const { startContainer, startOffset } = range
      const insideMention = closestMention(startContainer)

      if (
        insideMention &&
        (insideMention === startContainer || insideMention.contains(startContainer))
      ) {
        deleteMentionElement(insideMention)
        handled = true
      } else if (startContainer.nodeType === Node.TEXT_NODE) {
        const textNode = startContainer as Text
        const prev = textNode.previousSibling

        // Only the caret sitting right on the chip is owned here. Deleting a
        // plain character next to a chip stays native: rewriting the text node
        // and cancelling `beforeinput` desyncs the IME from the DOM, and Android
        // drops the keyboard once the two models disagree.
        if (isMentionElement(prev) && startOffset === 0) {
          deleteMentionElement(prev as HTMLElement)
          handled = true
        }
      } else if (startContainer.nodeType === Node.ELEMENT_NODE) {
        const prev = startContainer.childNodes[startOffset - 1]

        if (isMentionElement(prev)) {
          deleteMentionElement(prev as HTMLElement)
          handled = true
        }
      }
    }

    return handled
  }

  /**
   * The chip directly left of the caret when the caret is on the chip's right
   * edge. Android pre-selects the character to delete before dispatching
   * `beforeinput`, so the caret anchor arrives here as a range covering it —
   * deleting the chip is the only sensible answer, the anchor is not a character.
   *
   * The anchor is not necessarily the FIRST character of that text node: typing
   * right after a chip pushes it along, so its position is looked up rather than
   * assumed. Assuming otherwise lets a plain backspace eat the anchor, and an
   * emptied text node after a chip is the state that makes Android drop the
   * keyboard.
   */
  function mentionOwningAnchorDelete(range: Range): HTMLElement | null {
    const { startContainer, endContainer, startOffset } = range

    if (startContainer.nodeType !== Node.TEXT_NODE) {
      return null
    }

    const text = startContainer as Text
    const anchorIndex = text.data.indexOf(CARET_ANCHOR)

    if (anchorIndex < 0 || anchorIndex < startOffset) {
      return null
    }

    const to = endContainer === startContainer ? range.endOffset : text.data.length

    if (anchorIndex >= to) {
      return null
    }

    const prev = text.previousSibling

    return isMentionElement(prev) ? (prev as HTMLElement) : null
  }

  /**
   * The paste is cancelled before this runs, so it has to land somewhere. With no
   * selection yet, fall back to the end of the editor rather than dropping the
   * content or letting unsanitized HTML in.
   */
  function resolvePasteRange(selection: Selection): Range {
    if (selection.rangeCount > 0) {
      return selection.getRangeAt(0)
    }

    const range = document.createRange()
    range.selectNodeContents(editorRef.value as HTMLElement)
    return range
  }

  function onPaste(ev: ClipboardEvent) {
    if (isDisabled()) {
      return
    }

    ev.preventDefault()

    const clipboard = ev.clipboardData
    const html = clipboard?.getData('text/html')
    const plain = clipboard?.getData('text/plain') ?? ''

    const selection = window.getSelection()

    if (!selection) {
      return
    }

    const range = resolvePasteRange(selection)
    range.deleteContents()

    const fragment = sanitizeMentionClipboardHtml(html || escapePlainTextAsHtml(plain))
    range.insertNode(fragment)

    range.collapse(false)
    selection.removeAllRanges()
    selection.addRange(range)

    ensureCaretAnchors()
    emitHTML()
  }

  function onBeforeInput(ev: InputEvent) {
    if (isDisabled()) {
      ev.preventDefault()
      return
    }

    notePendingAtInsert(ev)

    if (!isBackwardDeleteInputType(ev.inputType)) {
      return
    }

    // Cancelling keydown stops the editing command, so no `beforeinput` follows
    // and there is nothing to re-catch here.
    if (!isComposing.value && tryDeleteBackward()) {
      ev.preventDefault()
    }
  }

  function onKeydown(ev: KeyboardEvent) {
    if (isDisabled()) {
      return
    }

    if (ev.key === 'Backspace' || ev.key === 'Delete') {
      pendingAtInsert = false
    } else if (!ev.isComposing && ev.key === '@') {
      // Fallback when beforeinput is missing / omits data.
      pendingAtInsert = true
    }

    if (ev.key === 'Backspace' && !ev.isComposing) {
      if (tryDeleteBackward()) {
        ev.preventDefault()
      }
    }
  }

  function onInput() {
    if (isComposing.value) {
      return
    }

    ensureCaretAnchors()
    emitHTML()
    detectTriggerAfterInput()
  }

  function onCompositionStart() {
    isComposing.value = true
  }

  function onCompositionEnd() {
    isComposing.value = false
    ensureCaretAnchors()
    emitHTML()
    detectTriggerAfterInput()
  }

  /**
   * Copy the public contract, not the DOM: the DOM carries the caret anchor, an
   * invisible character that would otherwise travel into whatever the user pastes
   * into. The plain-text flavour keeps the chip's visible "@Label" form.
   */
  function onCopyOrCut(ev: ClipboardEvent) {
    const editor = editorRef.value
    const clipboard = ev.clipboardData
    const selection = window.getSelection()

    if (!editor || !clipboard || !selection || selection.rangeCount === 0) {
      return
    }

    const range = selection.getRangeAt(0)
    const source = document.createElement('div')

    if (range.collapsed) {
      for (const child of Array.from(editor.childNodes)) {
        source.appendChild(child.cloneNode(true))
      }
    } else {
      source.appendChild(range.cloneContents())
    }

    clipboard.setData('text/html', `<meta charset="utf-8">${serializeMentionHtml(source)}`)
    clipboard.setData('text/plain', (source.textContent ?? '').replace(/\u200B/g, ''))
    ev.preventDefault()

    if (ev.type === 'cut') {
      const selection = window.getSelection()

      if (selection && selection.rangeCount > 0) {
        selection.getRangeAt(0).deleteContents()
        ensureCaretAnchors()
        emitHTML()
      }
    }
  }

  function onClick(ev: MouseEvent) {
    const target = ev.target as Element | null
    const mention = target?.closest?.('at')

    if (!mention || !editorRef.value?.contains(mention) || !isMentionElement(mention)) {
      return
    }

    onMentionClick({
      key: mention.getAttribute('key') ?? '',
      label: getMentionLabel(mention as HTMLElement),
      event: ev,
    })
  }

  function mount() {
    applyHTML(getModelValue() ?? '')
  }

  watch(
    () => getModelValue(),
    (html) => {
      if (!editorRef.value) {
        return
      }

      const next = html ?? ''

      if (next === lastEmittedHtml) {
        return
      }

      const current = serializeMentionHtml(editorRef.value)

      if (next === current) {
        lastEmittedHtml = next
        return
      }

      applyHTML(next)
    },
  )

  onBeforeUnmount(() => {
    cancelScheduledRestore()
    clearTriggerRange()
  })

  return {
    isEmpty,
    isComposing,
    insertMention,
    restoreCaret,
    onBeforeInput,
    onInput,
    onKeydown,
    onPaste,
    onClick,
    onCopyOrCut,
    onCompositionStart,
    onCompositionEnd,
    mount,
  }
}
