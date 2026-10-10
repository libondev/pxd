import { afterEach, describe, expect, it } from 'vite-plus/test'
import { ref, shallowRef } from 'vue'
import { useMentionEditor } from '../../src/composables/_internal/use-mention-editor'
import {
  CARET_ANCHOR,
  DEFAULT_TRIGGER,
  MENTION_TAG_LOWER,
  queryMentionElements,
  serializeMentionHtml,
  setMentionEditorContent,
} from '../../src/utils/mention-html'
import { useSetupWrapper } from '../helpers/setup'

/**
 * Random operation sequences over the editor, with the invariants re-checked after
 * every single step.
 *
 * The reason this exists: the caret anchor is a load-bearing invariant with no
 * visible symptom until a real device misbehaves — Chrome on Android resolves a
 * selection sitting right after a `contenteditable="false"` element into that
 * element and the IME hides the keyboard. A one-shot test would not catch an
 * operation order that quietly drops an anchor; this does.
 *
 * happy-dom has no editing engine, so backspace is modelled the way Chrome on
 * Android does it: the character to delete is pre-selected, `beforeinput` fires,
 * and the DOM only changes if the handler does not cancel it.
 */

const ZWSP = CARET_ANCHOR
const TYPED = 'abcdefg hij'

interface Harness {
  editor: HTMLElement
  api: ReturnType<typeof useMentionEditor>
  model: ReturnType<typeof ref<string>>
}

function makeRng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 0x100000000
  }
}

function createHarness(initialHtml: string) {
  const editor = document.createElement('div')
  editor.setAttribute('contenteditable', 'true')
  document.body.appendChild(editor)
  editor.focus()

  const model = ref(initialHtml)
  const wrapper = useSetupWrapper(() =>
    useMentionEditor({
      editorRef: shallowRef<HTMLElement | undefined>(editor),
      getModelValue: () => model.value,
      getTriggers: () => [DEFAULT_TRIGGER],
      isDisabled: () => false,
      onUpdate: (html) => {
        model.value = html
      },
      onTrigger: () => {},
      onMentionClick: () => {},
    }),
  )

  const api = wrapper
  api.mount()
  editor.addEventListener('beforeinput', (e) => api.onBeforeInput(e as InputEvent))
  editor.addEventListener('input', () => api.onInput())
  editor.addEventListener('keydown', (e) => api.onKeydown(e as KeyboardEvent))
  editor.addEventListener('paste', (e) => api.onPaste(e as ClipboardEvent))

  return { editor, api, model } satisfies Harness
}

/**
 * happy-dom drops the selection when the node holding it leaves the tree, which a
 * real browser does not necessarily do. Re-seed the caret so an operation is
 * never skipped, rather than treating an absent selection as a contract failure.
 */
function ensureCaret(editor: HTMLElement) {
  if (getSelection()!.rangeCount > 0) {
    return
  }

  const nodes = textNodes(editor)

  if (nodes.length) {
    const node = nodes[nodes.length - 1]
    caretIn(node, node.data.length)
  } else {
    caretIn(editor, 0)
  }
}

function textNodes(editor: HTMLElement): Text[] {
  return Array.from(editor.childNodes).filter((n): n is Text => n.nodeType === Node.TEXT_NODE)
}

function chips(editor: HTMLElement): HTMLElement[] {
  return queryMentionElements(editor)
}

function caretIn(node: Node, offset: number) {
  const range = document.createRange()
  range.setStart(node, offset)
  range.collapse(true)
  const sel = getSelection()!
  sel.removeAllRanges()
  sel.addRange(range)
}

function caretAtRandomTextPosition(editor: HTMLElement, rng: () => number) {
  const nodes = textNodes(editor)

  if (!nodes.length) {
    caretIn(editor, 0)
    return
  }

  const node = nodes[Math.floor(rng() * nodes.length) % nodes.length]
  caretIn(node, Math.floor(rng() * (node.data.length + 1)))
}

function typeAtCaret(editor: HTMLElement, ch: string) {
  ensureCaret(editor)
  const sel = getSelection()!
  const range = sel.getRangeAt(0)
  const node = range.startContainer
  const offset = range.startOffset

  if (node.nodeType === Node.TEXT_NODE) {
    const t = node as Text
    t.textContent = t.data.slice(0, offset) + ch + t.data.slice(offset)
  } else {
    editor.dispatchEvent(
      new InputEvent('beforeinput', {
        inputType: 'insertText',
        data: ch,
        bubbles: true,
        cancelable: true,
      }),
    )
    const t = document.createTextNode(ch)
    ;(node as Element).insertBefore(t, (node as Element).childNodes[offset] ?? null)
  }

  const after = document.createRange()
  after.setStart(node, offset + ch.length)
  after.collapse(true)
  sel.removeAllRanges()
  sel.addRange(after)
  editor.dispatchEvent(new InputEvent('input', { bubbles: true }))
}

function androidBackspace(editor: HTMLElement): void {
  ensureCaret(editor)
  const sel = getSelection()!
  const range = sel.getRangeAt(0)

  if (range.startContainer.nodeType !== Node.TEXT_NODE) {
    return
  }

  const text = range.startContainer as Text
  const from = text.data.length - 1

  if (from < 0) {
    return
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
  editor.dispatchEvent(ev)

  if (ev.defaultPrevented) {
    return
  }

  doomed.deleteContents()
  caretIn(doomed.startContainer, doomed.startOffset)
  editor.dispatchEvent(new InputEvent('input', { bubbles: true }))
}

function pasteInto(editor: HTMLElement, html: string) {
  ensureCaret(editor)
  const ev = new ClipboardEvent('paste', { bubbles: true, cancelable: true })
  Object.defineProperty(ev, 'clipboardData', {
    value: { getData: (type: string) => (type === 'text/html' ? html : '') },
  })
  editor.dispatchEvent(ev)
}

function insertMentionLikeUser(h: Harness) {
  const nodes = textNodes(h.editor)

  if (!nodes.length) {
    caretIn(h.editor, 0)
  } else {
    const node = nodes[nodes.length - 1]
    caretIn(node, node.data.length)
  }

  const sel = getSelection()!
  const range = sel.getRangeAt(0)
  const node = range.startContainer
  const offset = range.startOffset

  h.editor.dispatchEvent(
    new InputEvent('beforeinput', {
      inputType: 'insertText',
      data: '@',
      bubbles: true,
      cancelable: true,
    }),
  )

  if (node.nodeType === Node.TEXT_NODE) {
    const t = node as Text
    t.textContent = t.data.slice(0, offset) + '@' + t.data.slice(offset)
  }

  caretIn(node, offset + 1)
  h.editor.dispatchEvent(new InputEvent('input', { bubbles: true }))
  h.api.insertMention('u1', 'Alice')
}

/** Collects every violation with its context; the run asserts the list is empty. */
function collectViolations(
  h: Harness,
  problems: string[],
  seed: number,
  step: number,
  action: string,
) {
  const where = 'seed ' + seed + ' step ' + step + ' after "' + action + '"'
  const model = h.model.value ?? ''

  for (const chip of chips(h.editor)) {
    const next = chip.nextSibling
    const anchored =
      !!next && next.nodeType === Node.TEXT_NODE && (next.textContent ?? '').includes(ZWSP)

    if (!anchored) {
      problems.push(
        where + ' — chip lost its anchor: ' + chip.outerHTML + ' in ' + h.editor.innerHTML,
      )
    }
  }

  if (model.includes(ZWSP)) {
    problems.push(where + ' — anchor leaked into the public value: ' + JSON.stringify(model))
  }

  const anchor = getSelection()!.anchorNode
  const inChip = !!(
    anchor &&
    (anchor.nodeType === 1
      ? (anchor as Element).closest(MENTION_TAG_LOWER)
      : anchor.parentElement && anchor.parentElement.closest(MENTION_TAG_LOWER))
  )

  if (inChip) {
    problems.push(where + ' — selection landed inside a chip: ' + h.editor.innerHTML)
  }

  const reparsed = document.createElement('div') as HTMLElement
  setMentionEditorContent(reparsed, model)

  if (serializeMentionHtml(reparsed) !== model) {
    problems.push(
      where +
        ' — public value is not a fixed point: ' +
        JSON.stringify(model) +
        ' -> ' +
        JSON.stringify(serializeMentionHtml(reparsed)),
    )
  }
}

const open: Harness[] = []

afterEach(() => {
  while (open.length) {
    const h = open.pop()!
    h.editor.remove()
  }
})

describe('useMentionEditor invariants under random operation sequences', () => {
  const seeds = [1, 7, 42, 1337, 20260930, 987654321]
  const steps = 120

  for (const seed of seeds) {
    it('holds every invariant through ' + steps + ' random operations', () => {
      const rng = makeRng(seed)
      const h = createHarness('Hello <mention key="1">Alice</mention>tail')
      const problems: string[] = []
      open.push(h)

      for (let step = 0; step < steps; step++) {
        const roll = rng()

        if (roll < 0.15) {
          caretAtRandomTextPosition(h.editor, rng)
          collectViolations(h, problems, seed, step, 'caret move')
          continue
        }

        let action = ''

        if (roll < 0.5) {
          const ch = TYPED.charAt(Math.floor(rng() * TYPED.length) % TYPED.length)
          typeAtCaret(h.editor, ch)
          action = 'type "' + ch + '"'
        } else if (roll < 0.78) {
          androidBackspace(h.editor)
          action = 'backspace'
        } else if (roll < 0.9) {
          insertMentionLikeUser(h)
          action = 'insert mention'
        } else {
          const html =
            rng() < 0.5 ? '<b>bold</b> text' : 'plain <mention key="2">Bob</mention> tail'
          pasteInto(h.editor, html)
          action = 'paste'
        }

        collectViolations(h, problems, seed, step, action)
      }

      expect(problems).toEqual([])
      expect(h.editor.querySelector('mention')).not.toBeNull()
    })
  }
})
