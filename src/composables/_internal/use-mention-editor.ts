import type { Ref, ShallowRef } from 'vue'
import { nextTick, onBeforeUnmount, shallowRef, watch } from 'vue'
import {
  createMentionElement,
  escapePlainTextAsHtml,
  getMentionLabel,
  isMentionEditorEmpty,
  isMentionElement,
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

  function getHTML(): string {
    if (!editorRef.value) {
      return ''
    }

    return serializeMentionHtml(editorRef.value)
  }

  function syncEmptyState() {
    if (!editorRef.value) {
      return
    }

    isEmpty.value = isMentionEditorEmpty(editorRef.value)
  }

  function emitHTML() {
    if (!editorRef.value || applyingExternal) {
      return
    }

    const html = serializeMentionHtml(editorRef.value)
    syncEmptyState()
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
    syncEmptyState()
    lastEmittedHtml = serializeMentionHtml(editorRef.value)

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
    const range = caret.cloneRange()

    try {
      range.setStart(range.startContainer, Math.max(0, range.startOffset - 1))
    } catch {
      return false
    }

    if (range.toString() !== '@') {
      return false
    }

    restoreRange = caret.cloneRange()
    triggerRange = range
    return true
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

    const space = document.createTextNode(' ')
    mention.after(space)

    const selection = window.getSelection()
    const after = document.createRange()
    after.setStartAfter(space)
    after.collapse(true)
    selection?.removeAllRanges()
    selection?.addRange(after)

    triggerRange = null
    restoreRange = after.cloneRange()
    emitHTML()
    return true
  }

  function getMentionBeforeCaret(): HTMLElement | null {
    const selection = window.getSelection()

    if (!selection || !selection.isCollapsed || selection.rangeCount === 0) {
      return null
    }

    const range = selection.getRangeAt(0)
    const { startContainer, startOffset } = range

    if (startContainer.nodeType === Node.TEXT_NODE) {
      if (startOffset > 0) {
        return null
      }

      const prev = startContainer.previousSibling
      return isMentionElement(prev) ? (prev as HTMLElement) : null
    }

    if (startContainer.nodeType === Node.ELEMENT_NODE) {
      const prev = startContainer.childNodes[startOffset - 1]
      return isMentionElement(prev) ? (prev as HTMLElement) : null
    }

    return null
  }

  function deleteMentionElement(mention: HTMLElement) {
    const selection = window.getSelection()
    const range = document.createRange()
    range.setStartBefore(mention)
    range.collapse(true)

    mention.remove()
    selection?.removeAllRanges()
    selection?.addRange(range)
    emitHTML()
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
      const mention = getMentionBeforeCaret()

      if (mention) {
        ev.preventDefault()
        deleteMentionElement(mention)
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
      const mention = getMentionBeforeCaret()

      if (mention) {
        ev.preventDefault()
        deleteMentionElement(mention)
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
