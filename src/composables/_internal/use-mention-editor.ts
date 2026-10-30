import type { Ref, ShallowRef } from 'vue'
import { onBeforeUnmount, shallowRef, watch } from 'vue'
import {
  CARET_ANCHOR,
  DEFAULT_TRIGGER,
  MENTION_TAG_LOWER,
  createCaretAnchor,
  createMentionElement,
  escapePlainTextAsHtml,
  getMentionLabel,
  isMentionElement,
  queryMentionElements,
  sanitizeMentionClipboardHtml,
  serializeMentionHtml,
  setMentionEditorContent,
} from '../../utils/_internal/mention-html.js'

export interface UseMentionEditorOptions {
  editorRef: Ref<HTMLElement | undefined>
  getModelValue: () => string
  getTriggers: () => string[]
  isDisabled: () => boolean
  isSubmitOnEnter: () => boolean
  onUpdate: (html: string) => void
  onTrigger: (trigger: string) => void
  onSubmit: (html: string) => void
  onMentionClick: (payload: {
    key: string
    label: string
    trigger: string
    event: MouseEvent
  }) => void
}

export interface UseMentionEditorReturn {
  isEmpty: ShallowRef<boolean>
  isComposing: ShallowRef<boolean>
  insertMention: (key: string, label: string, trigger?: string) => boolean
  focus: () => void
  blur: () => void
  clear: () => void
  setText: (text: string) => void
  insertText: (text: string) => boolean
  replaceQuery: (text: string) => boolean
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

/** Contenteditable mention editor: HTML sync, trigger ranges, chip insert/delete, paste. */
export function useMentionEditor({
  editorRef,
  getModelValue,
  getTriggers,
  isDisabled,
  isSubmitOnEnter,
  onUpdate,
  onTrigger,
  onSubmit,
  onMentionClick,
}: UseMentionEditorOptions): UseMentionEditorReturn {
  const isComposing = shallowRef(false)
  const isEmpty = shallowRef(true)

  let triggerRange: Range | null = null
  let triggerKeyword = DEFAULT_TRIGGER
  let restoreRange: Range | null = null
  let restoreTimer: ReturnType<typeof setTimeout> | null = null
  let lastEmittedHtml = ''
  // Only open suggest when `@` was inserted — not when delete/undo leaves `@` before the caret.
  let pendingAtInsert = false

  function setCaret(range: Range) {
    window.getSelection()?.removeAllRanges()
    window.getSelection()?.addRange(range)
  }

  function clearTriggerRange() {
    triggerRange = null
    triggerKeyword = DEFAULT_TRIGGER
    restoreRange = null
  }

  function cancelScheduledRestore() {
    if (restoreTimer != null) {
      clearTimeout(restoreTimer)
      restoreTimer = null
    }
  }

  // Chips need an editable text node on their right or Android drops the keyboard;
  // re-assert after every input instead of guarding each delete/undo path.
  function ensureCaretAnchors() {
    const editor = editorRef.value

    if (!editor) {
      return
    }

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
    isEmpty.value = html === ''
    lastEmittedHtml = html
    onUpdate(html)
  }

  function applyHTML(html: string): string {
    if (!editorRef.value) {
      return ''
    }

    clearTriggerRange()
    cancelScheduledRestore()

    setMentionEditorContent(editorRef.value, html)
    const serialized = serializeMentionHtml(editorRef.value)
    isEmpty.value = serialized === ''
    // Recorded before returning, so the model watcher never re-applies our own write.
    lastEmittedHtml = serialized
    return serialized
  }

  // Deferred: focusing while the popover focus-trap is still active gets pulled back in.
  function restoreCaret() {
    cancelScheduledRestore()

    restoreTimer = setTimeout(() => {
      restoreTimer = null
      const editor = editorRef.value
      const range = restoreRange
      clearTriggerRange()
      editor?.focus({ preventScroll: true })

      try {
        if (editor && range && editor.contains(range.startContainer)) {
          setCaret(range)
        }
      } catch {
        // Stale range after DOM changes; focus alone is enough.
      }
    }, 0)
  }

  function findTriggerBeforeCaret(caret: Range): { keyword: string; range: Range } | null {
    // Longest first, so `[[` wins over `[`.
    for (const keyword of [...getTriggers()].sort((a, b) => b.length - a.length)) {
      const start = caret.startOffset - keyword.length

      if (start < 0) {
        continue
      }

      const range = caret.cloneRange()

      try {
        range.setStart(range.startContainer, start)
      } catch {
        continue
      }

      if (range.toString() === keyword && isTriggerBoundary(range)) {
        return { keyword, range }
      }
    }

    return null
  }

  function saveTriggerRangeFromSelection() {
    const selection = window.getSelection()

    if (!selection || selection.rangeCount === 0 || !selection.isCollapsed) {
      return false
    }

    const caret = selection.getRangeAt(0)
    const found = findTriggerBeforeCaret(caret)

    if (!found) {
      return false
    }

    restoreRange = caret.cloneRange()
    triggerRange = found.range
    triggerKeyword = found.keyword
    return true
  }

  // Fires only at content start, after whitespace, or right after a chip; never mid-word.
  function isTriggerBoundary(keywordRange: Range): boolean {
    const before = boundaryBefore(keywordRange.startContainer, keywordRange.startOffset)

    return (
      before === 'start' || before === 'mention' || /\s/.test(before) || before === CARET_ANCHOR
    )
  }

  // The editor only holds text nodes, chips and <br>, so stepping back one node is enough.
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
      onTrigger(triggerKeyword)
    }
  }

  function notePendingAtInsert(ev: InputEvent) {
    const insert =
      ev.inputType === 'insertText' ||
      ev.inputType === 'insertCompositionText' ||
      ev.inputType === 'insertReplacementText'

    pendingAtInsert = insert && ev.data != null && getTriggers().some((k) => ev.data?.includes(k))
  }

  function resolveInsertRange(): Range | null {
    const editor = editorRef.value

    if (!editor) {
      return null
    }

    // An empty editor is just the placeholder <br>: a full range lets the caller's
    // deleteContents clear it instead of inserting after it.
    if (isEmpty.value) {
      const range = document.createRange()
      range.selectNodeContents(editor)
      return range
    }

    const selection = window.getSelection()

    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)

      if (editor.contains(range.startContainer) && editor.contains(range.endContainer)) {
        return range.cloneRange()
      }
    }

    const range = document.createRange()
    range.selectNodeContents(editor)
    range.collapse(false)
    return range
  }

  function insertMention(key: string, label: string, trigger?: string): boolean {
    if (!editorRef.value || isDisabled()) {
      return false
    }

    let range = triggerRange
    let keyword = triggerKeyword

    if (range && editorRef.value.contains(range.startContainer)) {
      if (trigger !== undefined) {
        keyword = trigger
      }
    } else {
      range = resolveInsertRange()
      keyword = trigger ?? DEFAULT_TRIGGER
    }

    if (!range) {
      return false
    }

    range.deleteContents()

    const mention = createMentionElement(key, label, keyword)
    range.insertNode(mention)

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

  function focus() {
    editorRef.value?.focus({ preventScroll: true })
  }

  function blur() {
    editorRef.value?.blur()
  }

  function placeCaret(node: Node, offset: number) {
    const range = document.createRange()
    range.setStart(node, offset)
    range.collapse(true)
    setCaret(range)
  }

  function placeCaretAfter(node: Node) {
    const range = document.createRange()
    range.setStartAfter(node)
    range.collapse(true)
    setCaret(range)
  }

  function placeCaretAtEnd() {
    const editor = editorRef.value

    if (!editor) {
      return
    }

    const range = document.createRange()
    range.selectNodeContents(editor)
    range.collapse(false)
    setCaret(range)
  }

  function clear() {
    onUpdate(applyHTML(''))
  }

  function setText(text: string) {
    onUpdate(applyHTML(escapePlainTextAsHtml(text)))
    placeCaretAtEnd()
  }

  function insertText(text: string): boolean {
    const range = resolveInsertRange()

    if (!range || isDisabled()) {
      return false
    }

    range.deleteContents()
    range.insertNode(sanitizeMentionClipboardHtml(escapePlainTextAsHtml(text)))
    range.collapse(false)
    setCaret(range)

    ensureCaretAnchors()
    emitHTML()
    return true
  }

  // Swap the active trigger + query span for escaped text; only while the span is alive.
  function replaceQuery(text: string): boolean {
    const range = triggerRange

    if (
      !editorRef.value ||
      isDisabled() ||
      !range ||
      !editorRef.value.contains(range.startContainer)
    ) {
      return false
    }

    range.deleteContents()

    if (text) {
      range.insertNode(sanitizeMentionClipboardHtml(escapePlainTextAsHtml(text)))
    }

    range.collapse(false)
    clearTriggerRange()
    restoreRange = range.cloneRange()
    setCaret(range)

    ensureCaretAnchors()
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
    const mention = el?.closest?.(MENTION_TAG_LOWER)

    if (!mention || !editorRef.value.contains(mention) || !isMentionElement(mention)) {
      return null
    }

    return mention as HTMLElement
  }

  function deleteMentionElement(mention: HTMLElement) {
    const editor = editorRef.value
    const parent = mention.parentNode

    if (!editor || !parent || !editor.contains(mention)) {
      return
    }

    // The anchor always follows a chip, so `next` is the text node the caret belongs in.
    const next = mention.nextSibling

    cancelScheduledRestore()
    clearTriggerRange()

    mention.remove()
    editor.focus({ preventScroll: true })

    const before = mention.previousSibling

    if (before?.nodeType === Node.TEXT_NODE && editor.contains(before)) {
      placeCaret(before, before.textContent?.length ?? 0)
    } else if (before && editor.contains(before)) {
      placeCaretAfter(before)
    } else if (next && editor.contains(next)) {
      placeCaret(next, 0)
    }

    emitHTML()
  }

  // Own the deletes that would eat a chip or its anchor; plain-character deletes stay
  // native — rewriting text nodes desyncs the IME and Android drops the keyboard.
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
        const prev = (startContainer as Text).previousSibling

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

  // Android pre-selects the character to delete, so the anchor arrives as a selected
  // range; its position is looked up because typing after a chip pushes it along.
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

  function onPaste(ev: ClipboardEvent) {
    if (isDisabled()) {
      return
    }

    ev.preventDefault()

    const clipboard = ev.clipboardData
    const selection = window.getSelection()

    if (!selection) {
      return
    }

    let range: Range

    if (selection.rangeCount > 0) {
      range = selection.getRangeAt(0)
    } else {
      // The paste is cancelled before this runs, so it has to land somewhere.
      range = document.createRange()
      range.selectNodeContents(editorRef.value as HTMLElement)
    }

    range.deleteContents()
    range.insertNode(
      sanitizeMentionClipboardHtml(
        clipboard?.getData('text/html') || escapePlainTextAsHtml(clipboard?.getData('text/plain') ?? ''),
      ),
    )
    range.collapse(false)
    setCaret(range)

    ensureCaretAnchors()
    emitHTML()
  }

  function onBeforeInput(ev: InputEvent) {
    if (isDisabled()) {
      ev.preventDefault()
      return
    }

    notePendingAtInsert(ev)

    const backwardDelete =
      ev.inputType === 'deleteEntireSoftLine' || ev.inputType.endsWith('Backward')

    if (backwardDelete && !isComposing.value && tryDeleteBackward()) {
      ev.preventDefault()
    }
  }

  function onKeydown(ev: KeyboardEvent) {
    if (isDisabled()) {
      return
    }

    // Enter submits, Shift+Enter breaks the line, and `isComposing` keeps IME confirmation native.
    if (ev.key === 'Enter' && !ev.shiftKey && !ev.isComposing) {
      if (!isSubmitOnEnter()) {
        return
      }

      ev.preventDefault()

      if (editorRef.value) {
        onSubmit(serializeMentionHtml(editorRef.value))
      }

      return
    }

    if (ev.key === 'Backspace' || ev.key === 'Delete') {
      pendingAtInsert = false
    } else if (!ev.isComposing && getTriggers().includes(ev.key)) {
      // Fallback when beforeinput is missing / omits data.
      pendingAtInsert = true
    }

    if (ev.key === 'Backspace' && !ev.isComposing && tryDeleteBackward()) {
      ev.preventDefault()
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

  // Copy the public contract, not the DOM — the DOM carries the invisible caret anchor.
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

    if (ev.type === 'cut' && selection.rangeCount > 0) {
      selection.getRangeAt(0).deleteContents()
      ensureCaretAnchors()
      emitHTML()
    }
  }

  function onClick(ev: MouseEvent) {
    const mention = (ev.target as Element | null)?.closest?.(MENTION_TAG_LOWER)

    if (!mention || !editorRef.value?.contains(mention) || !isMentionElement(mention)) {
      return
    }

    onMentionClick({
      key: mention.getAttribute('key') ?? '',
      label: getMentionLabel(mention as HTMLElement),
      trigger: mention.getAttribute('trigger') || DEFAULT_TRIGGER,
      event: ev,
    })
  }

  function mount() {
    applyHTML(getModelValue())
  }

  watch(getModelValue, (html) => {
    const editor = editorRef.value

    if (!editor || html === lastEmittedHtml) {
      return
    }

    if (html === serializeMentionHtml(editor)) {
      lastEmittedHtml = html
      return
    }

    applyHTML(html)
  })

  onBeforeUnmount(() => {
    cancelScheduledRestore()
    clearTriggerRange()
  })

  return {
    isEmpty,
    isComposing,
    insertMention,
    focus,
    blur,
    clear,
    setText,
    insertText,
    replaceQuery,
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
