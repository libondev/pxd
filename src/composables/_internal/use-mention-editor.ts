import type { Ref, ShallowRef } from 'vue'
import { nextTick, onBeforeUnmount, shallowRef, watch } from 'vue'
import {
  createMentionElement,
  ensureMentionCaretPads,
  escapePlainTextAsHtml,
  getMentionLabel,
  isMentionElement,
  MENTION_CARET_PAD,
  sanitizeMentionClipboardHtml,
  serializeMentionHtml,
  setMentionEditorContent,
  stripMentionCaretPads,
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
  getHTML: () => string
  insertMention: (key: string, label: string) => boolean
  restoreCaret: (deferred?: boolean) => void
  clearTriggerRange: () => void
  onBeforeInput: (ev: InputEvent) => void
  onInput: () => void
  onKeydown: (ev: KeyboardEvent) => void
  onPaste: (ev: ClipboardEvent) => void
  onClick: (ev: MouseEvent) => void
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
  let applyingExternal = false
  let lastEmittedHtml = ''
  // Only open suggest when `@` was inserted — not when delete/undo leaves `@` before the caret.
  let pendingAtInsert = false
  // keydown + beforeinput can both fire; ignore the second pass in the same turn.
  let owningBackwardDelete = false

  function getHTML(): string {
    if (!editorRef.value) {
      return ''
    }

    return serializeMentionHtml(editorRef.value)
  }

  function syncEmptyState(html: string) {
    isEmpty.value = html.trim() === ''
  }

  function emitHTML() {
    if (!editorRef.value || applyingExternal) {
      return
    }

    const html = serializeMentionHtml(editorRef.value)
    syncEmptyState(html)
    lastEmittedHtml = html
    onUpdate(html)
  }

  async function applyHTML(html: string) {
    if (!editorRef.value) {
      return
    }

    // Drop Range → detached-node retention before replacing children.
    clearTriggerRange()
    cancelScheduledRestore()

    applyingExternal = true
    setMentionEditorContent(editorRef.value, html)
    const serialized = serializeMentionHtml(editorRef.value)
    syncEmptyState(serialized)
    lastEmittedHtml = serialized

    await nextTick()
    applyingExternal = false
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
   * Restore caret after the popover focus-trap deactivates.
   * Sync focus while the trap is still active gets pulled back into the popover.
   */
  function restoreCaret(deferred: boolean = false) {
    cancelScheduledRestore()

    if (!deferred) {
      applyRestoreCaret()
      return
    }

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
   * `@` must sit at editor/line start or after whitespace — not mid-word (`hello@`).
   */
  function isAtTriggerBoundary(atRange: Range): boolean {
    const prev = charImmediatelyBefore(atRange.startContainer, atRange.startOffset)

    if (prev === null) {
      return true
    }

    return /\s/.test(prev)
  }

  /** Preceding character, or `null` when at the start of the editor content. */
  function charImmediatelyBefore(container: Node, offset: number): string | null {
    if (container.nodeType === Node.TEXT_NODE) {
      const text = container.textContent ?? ''

      if (offset > 0) {
        const ch = text.charAt(offset - 1)
        return ch === MENTION_CARET_PAD ? charImmediatelyBefore(container, offset - 1) : ch
      }

      return charFromPreviousSibling(container.previousSibling)
    }

    if (container.nodeType === Node.ELEMENT_NODE) {
      if (offset === 0) {
        return charFromPreviousSibling(container.previousSibling)
      }

      return charFromPreviousSibling(container.childNodes[offset - 1])
    }

    return null
  }

  function charFromPreviousSibling(node: Node | null): string | null {
    let prev = node

    while (prev) {
      if (isMentionElement(prev)) {
        return '\0'
      }

      if ((prev as Element).nodeName === 'BR') {
        return '\n'
      }

      if (prev.nodeType === Node.TEXT_NODE) {
        const text = stripMentionCaretPads(prev.textContent ?? '')

        if (!text.length) {
          prev = prev.previousSibling
          continue
        }

        return text.charAt(text.length - 1)
      }

      if (prev.nodeType === Node.ELEMENT_NODE && prev.lastChild) {
        prev = prev.lastChild
        continue
      }

      return '\0'
    }

    return null
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

    // Visible space for typing + ZWSP so mobile can keep a caret after the atomic chip.
    const tail = document.createTextNode(` ${MENTION_CARET_PAD}`)
    mention.after(tail)

    const caret = document.createRange()
    caret.setStart(tail, tail.textContent?.length ?? 0)
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

  function deleteMentionElement(mention: HTMLElement) {
    const editor = editorRef.value

    if (!editor || !mention.parentNode) {
      return
    }

    const before = mention.previousSibling
    const next = mention.nextSibling

    // Park the caret in a text node that will survive the remove. Mobile browsers
    // (Android Chrome included) blur the contenteditable host if selection is still
    // anchored to the node being deleted — which dismisses the virtual keyboard.
    let landing: Text

    if (next?.nodeType === Node.TEXT_NODE) {
      landing = next as Text
    } else {
      landing = document.createTextNode(MENTION_CARET_PAD)
      mention.after(landing)
    }

    if (!(landing.textContent ?? '').length) {
      landing.textContent = MENTION_CARET_PAD
    }

    retainEditorFocus()
    placeCaret(landing, landing.textContent?.length ?? 0)

    mention.remove()

    const visible = stripMentionCaretPads(landing.textContent ?? '')

    if (visible) {
      landing.textContent = visible
      retainEditorFocus()
      placeCaret(landing, 0)
    } else if (before?.nodeType === Node.TEXT_NODE && editor.contains(before)) {
      landing.remove()
      retainEditorFocus()
      placeCaret(before, before.textContent?.length ?? 0)
    } else {
      // Sole chip / non-text sibling before: keep ZWSP so the host stays focused on mobile.
      landing.textContent = MENTION_CARET_PAD
      retainEditorFocus()
      placeCaret(landing, 1)
    }

    ensureMentionCaretPads(editor)
    emitHTML()
  }

  /**
   * Own backward-delete next to / inside mention chips.
   * Mobile browsers otherwise select into `contenteditable=false` text or blur the host.
   */
  function tryDeleteBackward(): boolean {
    if (owningBackwardDelete) {
      return true
    }

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
      const mention = closestMention(range.startContainer) || closestMention(range.endContainer)

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

        if (isMentionElement(prev)) {
          if (startOffset > 0) {
            const content = textNode.textContent ?? ''
            const nextContent = content.slice(0, startOffset - 1) + content.slice(startOffset)
            const hadVisible = stripMentionCaretPads(content) !== ''

            if (stripMentionCaretPads(nextContent) === '') {
              if (!hadVisible) {
                deleteMentionElement(prev as HTMLElement)
              } else {
                textNode.textContent = MENTION_CARET_PAD
                retainEditorFocus()
                placeCaret(textNode, 1)
                emitHTML()
              }
            } else {
              textNode.textContent = nextContent
              retainEditorFocus()
              placeCaret(textNode, startOffset - 1)
              emitHTML()
            }

            handled = true
          } else {
            deleteMentionElement(prev as HTMLElement)
            handled = true
          }
        }
      } else if (startContainer.nodeType === Node.ELEMENT_NODE) {
        const prev = startContainer.childNodes[startOffset - 1]

        if (isMentionElement(prev)) {
          deleteMentionElement(prev as HTMLElement)
          handled = true
        } else if (prev?.nodeType === Node.TEXT_NODE) {
          const text = prev.textContent ?? ''

          if (stripMentionCaretPads(text) === '' && isMentionElement(prev.previousSibling)) {
            deleteMentionElement(prev.previousSibling as HTMLElement)
            handled = true
          }
        }
      }
    }

    if (handled) {
      owningBackwardDelete = true
      queueMicrotask(() => {
        owningBackwardDelete = false
      })
    }

    return handled
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

    if (!selection || selection.rangeCount === 0) {
      return
    }

    const range = selection.getRangeAt(0)
    range.deleteContents()

    const fragment = sanitizeMentionClipboardHtml(html || escapePlainTextAsHtml(plain))
    range.insertNode(fragment)

    range.collapse(false)
    selection.removeAllRanges()
    selection.addRange(range)

    if (editorRef.value) {
      ensureMentionCaretPads(editorRef.value)
    }

    emitHTML()
  }

  function onBeforeInput(ev: InputEvent) {
    if (isDisabled()) {
      ev.preventDefault()
      return
    }

    notePendingAtInsert(ev)

    // Let the browser own historyUndo / historyRedo.
    if (ev.inputType === 'deleteContentBackward') {
      if (tryDeleteBackward()) {
        ev.preventDefault()
      }
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
    if (isComposing.value || applyingExternal) {
      return
    }

    emitHTML()
    detectTriggerAfterInput()
  }

  function onCompositionStart() {
    isComposing.value = true
  }

  function onCompositionEnd() {
    isComposing.value = false
    emitHTML()
    detectTriggerAfterInput()
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
    void applyHTML(getModelValue() ?? '')
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

      void applyHTML(next)
    },
  )

  onBeforeUnmount(() => {
    cancelScheduledRestore()
    clearTriggerRange()
  })

  return {
    isEmpty,
    isComposing,
    getHTML,
    insertMention,
    restoreCaret,
    clearTriggerRange,
    onBeforeInput,
    onInput,
    onKeydown,
    onPaste,
    onClick,
    onCompositionStart,
    onCompositionEnd,
    mount,
  }
}
