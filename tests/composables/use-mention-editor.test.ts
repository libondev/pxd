import { afterEach, describe, expect, it } from 'vite-plus/test'
import { ref, shallowRef } from 'vue'
import { useMentionEditor } from '../../src/composables/_internal/use-mention-editor'
import { CARET_ANCHOR, queryMentionElements } from '../../src/utils/mention-html'
import { useSetupWrapper } from '../helpers/setup'

/**
 * happy-dom has no native editing and, more importantly, no Blink. It will never
 * reproduce the Android behaviour this component has to survive: Chrome on Android
 * resolves a collapsed selection sitting right after a `contenteditable="false"`
 * element *into* that element, and the IME then drops the soft keyboard while the
 * editor stays focused. Desktop Blink keeps the position, so the bug is invisible
 * everywhere except the device.
 *
 * These tests therefore pin the two things that ARE checkable and that make the
 * device behave: the DOM invariant (every chip is anchored to real text) and the
 * decisions the composable makes about which deletes it takes over.
 */

const ZWSP = CARET_ANCHOR

interface Harness {
  editor: HTMLElement
  api: ReturnType<typeof useMentionEditor>
  model: ReturnType<typeof ref<string>>
  updates: string[]
  triggers: { n: number }
  clicks: { key: string; label: string }[]
  destroy: () => void
}

const open: Harness[] = []

function createHarness(initialHtml = ''): Harness {
  const editor = document.createElement('div')
  editor.className = 'pxd-mention-editor'
  editor.setAttribute('contenteditable', 'true')
  document.body.appendChild(editor)
  editor.focus()

  const model = ref(initialHtml)
  const updates: string[] = []
  const clicks: { key: string; label: string }[] = []
  const triggers = { n: 0 }

  const wrapper = useSetupWrapper(() => {
    const editorRef = shallowRef<HTMLElement | undefined>(editor)

    return useMentionEditor({
      editorRef,
      getModelValue: () => model.value,
      isDisabled: () => false,
      onUpdate: (html) => {
        model.value = html
        updates.push(html)
      },
      onTrigger: () => {
        triggers.n += 1
      },
      onMentionClick: (payload) => {
        clicks.push({ key: payload.key, label: payload.label })
      },
    })
  })

  const harness: Harness = {
    editor,
    api: wrapper,
    model,
    updates,
    triggers,
    clicks,
    destroy: wrapper.unmount,
  }

  harness.api.mount()

  // The component binds these on its template; mirror that here.
  const api = harness.api
  editor.addEventListener('beforeinput', (e) => api.onBeforeInput(e as InputEvent))
  editor.addEventListener('input', () => api.onInput())
  editor.addEventListener('keydown', (e) => api.onKeydown(e as KeyboardEvent))
  editor.addEventListener('paste', (e) => api.onPaste(e as ClipboardEvent))
  editor.addEventListener('click', (e) => api.onClick(e as MouseEvent))
  editor.addEventListener('copy', (e) => api.onCopyOrCut(e as ClipboardEvent))
  editor.addEventListener('cut', (e) => api.onCopyOrCut(e as ClipboardEvent))
  editor.addEventListener('compositionstart', () => api.onCompositionStart())
  editor.addEventListener('compositionend', () => api.onCompositionEnd())

  open.push(harness)
  return harness
}

afterEach(() => {
  while (open.length) {
    const h = open.pop()!
    h.destroy()
    h.editor.remove()
  }
})

function textNodes(editor: HTMLElement): Text[] {
  return Array.from(editor.childNodes).filter((n): n is Text => n.nodeType === Node.TEXT_NODE)
}

function chips(editor: HTMLElement): HTMLElement[] {
  return queryMentionElements(editor)
}

/** Chips with no editable text node on their right — the failure list is the message. */
function unanchoredChips(editor: HTMLElement): string[] {
  return chips(editor)
    .filter((chip) => {
      const next = chip.nextSibling
      return !next || next.nodeType !== Node.TEXT_NODE || !(next.textContent ?? '').includes(ZWSP)
    })
    .map((chip) => chip.outerHTML)
}

function expectAnchorInvariant(editor: HTMLElement) {
  expect(unanchoredChips(editor)).toEqual([])
}

function caretIn(node: Node, offset: number) {
  const range = document.createRange()
  range.setStart(node, offset)
  range.collapse(true)
  const sel = getSelection()!
  sel.removeAllRanges()
  sel.addRange(range)
}

function caretInsideChip(editor: HTMLElement, offset: number) {
  const chip = chips(editor)[0]
  caretIn(chip.firstChild as Text, offset)
}

function lastText(editor: HTMLElement): Text {
  return textNodes(editor)
    .filter((t) => t.data.length > 0)
    .pop() as Text
}

/** Simulates a plain character landing at the caret, the way a browser would. */
function typeAtCaret(text: string) {
  const sel = getSelection()!
  const range = sel.getRangeAt(0)
  const node = range.startContainer
  const offset = range.startOffset

  if (node.nodeType === Node.TEXT_NODE) {
    const t = node as Text
    t.textContent = t.data.slice(0, offset) + text + t.data.slice(offset)
  } else {
    const t = document.createTextNode(text)
    ;(node as Element).insertBefore(t, (node as Element).childNodes[offset] ?? null)
  }

  const after = document.createRange()
  after.setStart(node, offset + text.length)
  after.collapse(true)
  sel.removeAllRanges()
  sel.addRange(after)
}

/**
 * Mirrors Chrome on Android for a backspace: the character to delete is
 * pre-selected and `beforeinput` fires; the DOM only changes if the handler does
 * not cancel it. happy-dom has no editing engine, so the deletion is applied here.
 */
function androidBackspace(h: Harness): boolean {
  const sel = getSelection()!
  const range = sel.getRangeAt(0)

  if (range.startContainer.nodeType !== Node.TEXT_NODE) {
    return false
  }

  const text = range.startContainer as Text
  const from = text.data.length - 1

  if (from < 0) {
    return false
  }

  const doomed = document.createRange()
  doomed.setStart(text, from)
  doomed.setEnd(text, text.data.length)
  sel.removeAllRanges()
  sel.addRange(doomed)

  const ev = new InputEvent('beforeinput', {
    inputType: 'deleteContentBackward',
    bubbles: true,
    cancelable: true,
  })
  h.editor.dispatchEvent(ev)

  if (ev.defaultPrevented) {
    return true
  }

  doomed.deleteContents()
  caretIn(doomed.startContainer, doomed.startOffset)
  h.editor.dispatchEvent(new InputEvent('input', { bubbles: true }))
  return false
}

/** Types `@` the way a browser reports it, so the trigger detection runs. */
function typeMentionTrigger(h: Harness) {
  const sel = getSelection()!
  const range = sel.getRangeAt(0)
  const text = range.startContainer as Text
  const offset = range.startOffset

  h.editor.dispatchEvent(
    new InputEvent('beforeinput', {
      inputType: 'insertText',
      data: '@',
      bubbles: true,
      cancelable: true,
    }),
  )

  text.textContent = text.data.slice(0, offset) + '@' + text.data.slice(offset)
  caretIn(text, offset + 1)
  h.editor.dispatchEvent(new InputEvent('input', { bubbles: true }))
  void sel
}

describe('useMentionEditor', () => {
  it('renders the model into the DOM and keeps the anchor invariant', () => {
    const h = createHarness('Hello <at key="1">Alice</at>tail')
    expect(h.editor.querySelector('at')?.getAttribute('key')).toBe('1')
    expectAnchorInvariant(h.editor)
  })

  it('marks an empty editor as empty and clears the flag once it has content', () => {
    const h = createHarness('')
    expect(h.api.isEmpty.value).toBe(true)

    caretIn(h.editor, 0)
    typeAtCaret('x')
    h.editor.dispatchEvent(new InputEvent('input', { bubbles: true }))
    expect(h.api.isEmpty.value).toBe(false)
  })

  it('inserts a chip with an anchor and restores the caret into that anchor', async () => {
    const h = createHarness('Hello ')
    caretIn(lastText(h.editor), 6)
    typeMentionTrigger(h)
    expect(h.triggers.n).toBe(1)

    expect(h.api.insertMention('u1', 'Alice')).toBe(true)
    expectAnchorInvariant(h.editor)

    const anchor = h.editor.querySelector('at')!.nextSibling as Text
    expect(anchor.textContent).toBe(ZWSP)
    // The public value never carries the anchor.
    expect(h.model.value).toBe('Hello <at key="u1">Alice</at>')

    // The caret moves only once the suggest popover has released its focus trap.
    h.api.restoreCaret()
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(getSelection()!.anchorNode).toBe(anchor)
    expect(getSelection()!.anchorOffset).toBe(1)
  })

  it('opens the suggest popover for @ at a word boundary only', () => {
    const midWord = createHarness('mail')
    caretIn(lastText(midWord.editor), 4)
    typeMentionTrigger(midWord)
    expect(midWord.triggers.n).toBe(0)

    const afterSpace = createHarness('mail ')
    caretIn(lastText(afterSpace.editor), 5)
    typeMentionTrigger(afterSpace)
    expect(afterSpace.triggers.n).toBe(1)

    const afterChip = createHarness('<at key="1">Alice</at>')
    caretIn(afterChip.editor.querySelector('at')!.nextSibling as Text, 1)
    typeMentionTrigger(afterChip)
    expect(afterChip.triggers.n).toBe(1)
  })

  it('leaves an ordinary character delete to the browser', () => {
    const h = createHarness('<at key="1">Alice</at>tail')
    caretIn(lastText(h.editor), 4)
    expect(androidBackspace(h)).toBe(false)
    expect(h.model.value).toBe('<at key="1">Alice</at>tai')
    expectAnchorInvariant(h.editor)
  })

  it('takes over the delete that would eat the anchor and removes the whole chip', () => {
    const h = createHarness('<at key="1">Alice</at>tail')
    const anchor = h.editor.querySelector('at')!.nextSibling as Text

    // Delete the tail down to the anchor, then backspace once more.
    for (let i = 0; i < 4; i++) {
      caretIn(anchor, anchor.data.length)
      expect(androidBackspace(h)).toBe(false)
    }

    expect(h.editor.textContent).toContain('Alice')

    caretIn(anchor, anchor.data.length)
    expect(androidBackspace(h)).toBe(true)
    expect(h.editor.querySelector('at')).toBeNull()
    expect(h.model.value).toBe('')
  })

  it('keeps the anchor when text is typed right after a chip', () => {
    const h = createHarness('<at key="1">Alice</at>')
    const anchor = h.editor.querySelector('at')!.nextSibling as Text

    // Typing between the chip and the anchor pushes the anchor along: it is no
    // longer the first character of that text node.
    caretIn(anchor, 0)
    typeAtCaret('c')
    expect(anchor.data).toBe('c' + ZWSP)
    expectAnchorInvariant(h.editor)

    // Android pre-selects the character it wants deleted, which here is the
    // anchor sitting at the end of that text node. Deleting it would empty the
    // node, so the chip goes instead.
    caretIn(anchor, anchor.data.length)
    expect(androidBackspace(h)).toBe(true)
    expect(h.editor.querySelector('at')).toBeNull()
  })

  it('re-asserts the anchor when a selection replace removes it', () => {
    const h = createHarness('<at key="1">Alice</at>tail')
    const anchor = h.editor.querySelector('at')!.nextSibling as Text

    // A wide select-and-delete can swallow the invisible anchor even though the
    // backward-delete path refuses to; the invariant has to be restored anyway.
    anchor.data = 'tail'
    h.editor.dispatchEvent(new InputEvent('input', { bubbles: true }))

    const next = h.editor.querySelector('at')!.nextSibling as Text
    expect(next.data.startsWith(ZWSP)).toBe(true)
    expectAnchorInvariant(h.editor)
    expect(h.model.value).toBe('<at key="1">Alice</at>tail')
  })

  it('restores the anchor after an undo puts a chip back', () => {
    const h = createHarness('<at key="1">Alice</at>tail')
    const anchor = h.editor.querySelector('at')!.nextSibling as Text

    // Chromium's undo stack stores a DOM snapshot, so the anchor normally comes
    // back with the chip. Simulate the case where it does not, which is exactly
    // what ensureCaretAnchors exists for: the state is "a chip with no editable
    // node on its right", and it is the one Android turns into a lost keyboard.
    anchor.data = 'tail'
    h.editor.dispatchEvent(new InputEvent('input', { inputType: 'historyUndo', bubbles: true }))

    const next = h.editor.querySelector('at')!.nextSibling as Text
    expect(next.data.startsWith(ZWSP)).toBe(true)
    expectAnchorInvariant(h.editor)
  })

  it('removes the whole chip when the caret sits inside it', () => {
    const h = createHarness('Hi <at key="1">Alice</at>')
    caretInsideChip(h.editor, 2)

    const ev = new InputEvent('beforeinput', {
      inputType: 'deleteContentBackward',
      bubbles: true,
      cancelable: true,
    })
    h.editor.dispatchEvent(ev)

    expect(ev.defaultPrevented).toBe(true)
    expect(h.editor.querySelector('at')).toBeNull()
    expect(h.model.value).toBe('Hi ')
    expectAnchorInvariant(h.editor)
  })

  it('takes over a delete whose selection sits inside a chip', () => {
    const h = createHarness('Hi <at key="1">Alice</at> there')
    const chip = h.editor.querySelector('at')!
    const label = chip.firstChild as Text
    const range = document.createRange()
    range.setStart(label, 1)
    range.setEnd(label, 4)
    const sel = getSelection()!
    sel.removeAllRanges()
    sel.addRange(range)

    const ev = new InputEvent('beforeinput', {
      inputType: 'deleteContentBackward',
      bubbles: true,
      cancelable: true,
    })
    h.editor.dispatchEvent(ev)

    expect(ev.defaultPrevented).toBe(true)
    expect(h.editor.querySelector('at')).toBeNull()
    expect(h.model.value).toBe('Hi  there')
    expectAnchorInvariant(h.editor)
  })

  it('never emits the caret anchor in an update', () => {
    const h = createHarness('Hello <at key="1">Alice</at>tail')
    for (const html of h.updates) {
      expect(html).not.toContain(ZWSP)
    }

    caretIn(lastText(h.editor), 4)
    androidBackspace(h)
    for (const html of h.updates) {
      expect(html).not.toContain(ZWSP)
    }
    expect(h.model.value).not.toContain(ZWSP)
  })

  it('does not rebuild the DOM when the model echoes its own output', async () => {
    const h = createHarness('Hello <at key="1">Alice</at>tail')
    const editorBefore = h.editor
    const chipBefore = h.editor.querySelector('at')

    // Re-assigning the same value is what a parent does when it writes back the
    // value we just emitted; the editor must not tear its own DOM down for it.
    h.model.value = String(h.model.value)
    await Promise.resolve()

    expect(h.editor).toBe(editorBefore)
    expect(h.editor.querySelector('at')).toBe(chipBefore)
  })

  it('applies an external model change', async () => {
    const h = createHarness('Hello')
    h.model.value = 'Replaced <at key="9">Zoe</at>'
    await Promise.resolve()

    expect(h.editor.querySelector('at')?.getAttribute('key')).toBe('9')
    expectAnchorInvariant(h.editor)
  })

  it('pastes sanitized content at the caret and keeps the invariant', () => {
    const h = createHarness('Hello ')
    caretIn(lastText(h.editor), 6)

    const ev = new ClipboardEvent('paste', { bubbles: true, cancelable: true })
    Object.defineProperty(ev, 'clipboardData', {
      value: {
        getData: (type: string) => (type === 'text/html' ? '<b>x</b><at key="7">Bob</at>' : 'xBob'),
      },
    })
    h.editor.dispatchEvent(ev)

    expect(ev.defaultPrevented).toBe(true)
    expect(h.editor.querySelector('b')).toBeNull()
    expect(h.editor.querySelector('at')?.getAttribute('key')).toBe('7')
    expectAnchorInvariant(h.editor)
    // The sanitizer unwraps <b> to its text, so the pasted "x" survives as text.
    expect(h.model.value).toBe('Hello x<at key="7">Bob</at>')
    expect(h.model.value).not.toContain(ZWSP)
  })

  it('copies the public contract instead of the DOM, so no anchor leaks', () => {
    const h = createHarness('Hello <at key="1">Alice</at>tail')
    const store: Record<string, string> = {}
    const ev = new ClipboardEvent('copy', { bubbles: true, cancelable: true })
    Object.defineProperty(ev, 'clipboardData', {
      value: {
        setData: (type: string, value: string) => {
          store[type] = value
        },
      },
    })
    h.editor.dispatchEvent(ev)

    expect(ev.defaultPrevented).toBe(true)
    expect(store['text/html']).toContain('<at key="1">Alice</at>')
    expect(store['text/html']).not.toContain(ZWSP)
    expect(store['text/plain']).toBe('Hello @Alicetail')
  })

  it('cuts the selection and leaves the remaining chips anchored', () => {
    const h = createHarness('<at key="1">Alice</at>keep <at key="2">Bob</at>drop')
    const chip = chips(h.editor)[1]
    const range = document.createRange()
    range.setStartBefore(chip)
    range.setEndAfter(chip)
    const sel = getSelection()!
    sel.removeAllRanges()
    sel.addRange(range)

    const store: Record<string, string> = {}
    const ev = new ClipboardEvent('cut', { bubbles: true, cancelable: true })
    Object.defineProperty(ev, 'clipboardData', {
      value: {
        setData: (type: string, value: string) => {
          store[type] = value
        },
      },
    })
    h.editor.dispatchEvent(ev)

    expect(ev.defaultPrevented).toBe(true)
    expect(store['text/plain']).toBe('@Bob')
    expect(store['text/html']).not.toContain(ZWSP)
    // Only the selected chip goes; the text around it stays.
    expect(h.model.value).toBe('<at key="1">Alice</at>keep drop')
    expectAnchorInvariant(h.editor)
  })

  it('reports a chip click with its key and label', () => {
    const h = createHarness('<at key="1">Alice</at>')
    h.editor.querySelector('at')!.dispatchEvent(new MouseEvent('click', { bubbles: true }))

    expect(h.clicks).toEqual([{ key: '1', label: 'Alice' }])
  })

  it('does not emit while the user is composing', () => {
    const h = createHarness('Hello')
    h.api.onCompositionStart()
    expect(h.api.isComposing.value).toBe(true)

    typeAtCaret('x')
    h.editor.dispatchEvent(new InputEvent('input', { bubbles: true }))
    expect(h.updates).toHaveLength(0)

    h.api.onCompositionEnd()
    expect(h.updates).toHaveLength(1)
  })
})
