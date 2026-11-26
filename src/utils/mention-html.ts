import type { MentionHtmlToTextOptions, MentionHtmlToken } from '../components/mention/types'

const MENTION_TAG = 'MENTION'
export const MENTION_TAG_LOWER = MENTION_TAG.toLowerCase()

/** Elements that start a line of their own, typed or pasted. */
const BLOCK_TAGS = new Set([
  'ADDRESS',
  'ARTICLE',
  'ASIDE',
  'BLOCKQUOTE',
  'DD',
  'DIV',
  'DT',
  'FIGCAPTION',
  'FIGURE',
  'FOOTER',
  'H1',
  'H2',
  'H3',
  'H4',
  'H5',
  'H6',
  'HEADER',
  'LI',
  'MAIN',
  'NAV',
  'P',
  'PRE',
  'SECTION',
])

/** The trigger a chip falls back to when its markup carries no `trigger` attribute. */
export const DEFAULT_TRIGGER = '@'

/**
 * A collapsed selection sitting right after a `contenteditable=false` element is
 * not representable; Android resolves it *into* the element, the IME then finds
 * no editable context and hides the keyboard. A zero-width space after every chip
 * gives the caret a real text node to live in. It is stripped on serialize, so it
 * never reaches the public HTML, the v-model or the server.
 */
export const CARET_ANCHOR = '\u200B'

/**
 * The space a chip owns on its right. It must be a no-break space: Chrome
 * normalizes a trailing plain space away as soon as the next character is typed
 * into that text node, and the value loses the separation the chip was picked
 * with. Serialization turns it back into an ordinary space.
 */
export const CHIP_SEPARATOR = '\u00A0'

export function createCaretAnchor(): Text {
  return document.createTextNode(CARET_ANCHOR)
}

/**
 * Length of the chip's own prefix — the caret anchor plus at most one separator —
 * at the start of `text`. Zero when the text does not start with an anchor.
 */
export function chipPrefixLength(text: Text): number {
  return /^\u200B[\u00A0 ]?/.exec(text.data)?.[0].length ?? 0
}

export function isMentionElement(node: Node | null | undefined): boolean {
  return !!node && node.nodeType === Node.ELEMENT_NODE && (node as Element).tagName === MENTION_TAG
}

/**
 * Every chip in `root`. Pressing Enter nests content in block elements, so the
 * editor's direct children are not enough.
 */
export function queryMentionElements(root: ParentNode): HTMLElement[] {
  return Array.from(root.querySelectorAll(MENTION_TAG_LOWER)) as HTMLElement[]
}

export function getMentionLabel(el: HTMLElement): string {
  const trigger = el.getAttribute('trigger') || DEFAULT_TRIGGER
  const text = el.textContent ?? ''
  return text.startsWith(trigger) ? text.slice(trigger.length) : text
}

export function createMentionElement(
  key: string,
  label: string,
  trigger: string = DEFAULT_TRIGGER,
): HTMLElement {
  const el = document.createElement(MENTION_TAG_LOWER)
  el.setAttribute('key', key)

  if (trigger !== DEFAULT_TRIGGER) {
    el.setAttribute('trigger', trigger)
  }

  el.setAttribute('contenteditable', 'false')
  el.className = 'pxd-mention--chip'
  el.setAttribute('title', label)
  el.textContent = `${trigger}${label}`
  return el
}

function escapeMentionText(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function escapeMentionAttr(text: string): string {
  return escapeMentionText(text).replace(/"/g, '&quot;')
}

/** Escape plain text for paste fallback (newlines → `<br>`). */
export function escapePlainTextAsHtml(text: string): string {
  // The parser rewrites a leftover `\r` into `\n`, which would become a second <br>.
  return escapeMentionText(text.replace(/\r\n?/g, '\n')).replace(/\n/g, '<br>')
}

interface MentionTreeHandlers {
  /** A text node, with the editor's NBSP glue and caret anchors normalised away. */
  onText: (text: string) => void
  /** A legal `<mention>` chip. */
  onMention: (el: HTMLElement) => void
  /** One line ending, already de-duplicated against the block boundaries around it. */
  onBreak: () => void
}

/** A block holds lines when it carries text or a chip; `<br>`s mark them otherwise. */
function blockHoldsContent(el: Element): boolean {
  return !!(el.textContent || el.querySelector(MENTION_TAG_LOWER))
}

/** The first `<br>` of a content-less block is the line its boundary opened. */
function blockOwnBreaks(el: Element): number {
  return Math.max(0, el.querySelectorAll('br').length - 1)
}

/**
 * Walk a mention DOM tree in document order for every reader of the format: the
 * serializer, the public parser and the paste sanitizer. The line model lives here
 * so none of them re-implements how blocks and `<br>`s become lines.
 */
function walkMentionTree(root: Node, handlers: MentionTreeHandlers): void {
  // Whether the next output may still land on the current line.
  let atLineStart = true

  function emitBreak() {
    handlers.onBreak()
    atLineStart = true
  }

  function walk(node: Node) {
    if (node.nodeType === Node.TEXT_NODE) {
      // Normalize insert glue NBSP so a public value keeps ordinary spaces, and
      // drop the caret anchor so it never reaches the public value.
      const text = (node.textContent ?? '').replace(/\u00A0/g, ' ').replace(/\u200B/g, '')

      if (text) {
        handlers.onText(text)
        atLineStart = text.endsWith('\n')
      }

      return
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return
    }

    const el = node as HTMLElement

    if (isMentionElement(el)) {
      handlers.onMention(el)
      atLineStart = false
      return
    }

    if (el.tagName === 'BR') {
      emitBreak()
      return
    }

    if (BLOCK_TAGS.has(el.tagName)) {
      if (!atLineStart) {
        emitBreak()
      }

      if (blockHoldsContent(el)) {
        for (const child of Array.from(el.childNodes)) {
          walk(child)
        }
      } else {
        for (let i = 0, own = blockOwnBreaks(el); i < own; i++) {
          emitBreak()
        }
      }

      // A block keeps its last line even when it stayed empty.
      atLineStart = false
      return
    }

    for (const child of Array.from(el.childNodes)) {
      walk(child)
    }
  }

  for (const child of Array.from(root.childNodes)) {
    walk(child)
  }
}

/**
 * Serialize an editor DOM tree into the public HTML contract:
 * plain text + `<mention key="...">label</mention>` only.
 */
export function serializeMentionHtml(root: HTMLElement): string {
  let result = ''

  walkMentionTree(root, {
    onText: (text) => {
      // Escaping keeps a typed `<` or `&` from coming back as markup on the next parse.
      result += escapeMentionText(text)
    },
    onMention: (el) => {
      const key = el.getAttribute('key') ?? ''
      const label = getMentionLabel(el)
      const trigger = el.getAttribute('trigger')
      const triggerAttr = trigger ? ` trigger="${escapeMentionAttr(trigger)}"` : ''
      result += `<${MENTION_TAG_LOWER} key="${escapeMentionAttr(key)}"${triggerAttr}>${escapeMentionText(label)}</${MENTION_TAG_LOWER}>`
    },
    onBreak: () => {
      result += '\n'
    },
  })

  // The editor keeps a single <br> so an empty field still has a line box. That
  // placeholder is not a line break, so an empty value stays empty.
  return result === '\n' ? '' : result
}

/** Build a DocumentFragment from mention HTML (text + legal `<mention>` only). */
function mentionFragment(html: string): DocumentFragment {
  const fragment = document.createDocumentFragment()
  const doc = new DOMParser().parseFromString(html, 'text/html')

  walkMentionTree(doc.body, {
    onText: (text) => appendPlainText(fragment, text),
    onMention: (el) => appendSanitizedMention(fragment, el),
    onBreak: () => {
      fragment.appendChild(document.createElement('br'))
    },
  })

  return fragment
}

function parseMentionFragment(html: string): DocumentFragment {
  return html ? mentionFragment(html) : document.createDocumentFragment()
}

/**
 * Paste sanitizer: keep legal `<mention key>` nodes; everything else becomes text.
 */
export function sanitizeMentionClipboardHtml(html: string): DocumentFragment {
  return mentionFragment(html)
}

/**
 * Our copies carry the editor's edge line breaks as `\n`, so pasting them back would
 * add a blank line on every round trip.
 */
export function trimMentionEdgeBreaks(fragment: DocumentFragment): DocumentFragment {
  let first = fragment.firstChild

  while (first?.nodeName === 'BR') {
    first.remove()
    first = fragment.firstChild
  }

  let last = fragment.lastChild

  while (last?.nodeName === 'BR') {
    last.remove()
    last = fragment.lastChild
  }

  return fragment
}

/** A keyless `<mention>` is not ours, so it comes back as plain text. */
function appendSanitizedMention(target: Node, el: HTMLElement) {
  const key = el.getAttribute('key')

  if (key == null || key === '') {
    appendPlainText(target, el.textContent ?? '')
    return
  }

  target.appendChild(
    createMentionElement(key, getMentionLabel(el), el.getAttribute('trigger') || DEFAULT_TRIGGER),
  )
  // The anchor merges into the text node that follows, so the chip keeps an
  // editable node on its right without splitting the surrounding text.
  target.appendChild(createCaretAnchor())
}

function appendPlainText(target: Node, text: string) {
  const parts = text.split('\n')

  for (let i = 0; i < parts.length; i++) {
    if (parts[i]) {
      const last = target.lastChild

      if (last?.nodeType === Node.TEXT_NODE) {
        last.textContent = (last.textContent ?? '') + parts[i]
      } else {
        target.appendChild(document.createTextNode(parts[i]))
      }
    }

    if (i < parts.length - 1) {
      target.appendChild(document.createElement('br'))
    }
  }
}

export function setMentionEditorContent(root: HTMLElement, html: string) {
  root.replaceChildren()
  root.appendChild(parseMentionFragment(html))

  if (!root.childNodes.length) {
    root.appendChild(document.createElement('br'))
  }
}

/**
 * Parse the public mention HTML contract (text + legal `<mention>` only) into a
 * flat token list. Blocks and `<br>` become `\n` text, so joining the text
 * tokens matches the plain-text form of the value.
 */
export function parseMentionHtml(html: string): MentionHtmlToken[] {
  const tokens: MentionHtmlToken[] = []

  if (!html) {
    return tokens
  }

  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html')

  function appendText(text: string) {
    if (!text) {
      return
    }

    const last = tokens[tokens.length - 1]

    if (last?.type === 'text') {
      last.text += text
      return
    }

    tokens.push({ type: 'text', text })
  }

  walkMentionTree(doc.body, {
    onText: appendText,
    onMention: (el) => {
      tokens.push({
        type: 'mention',
        key: el.getAttribute('key') ?? '',
        label: getMentionLabel(el),
        trigger: el.getAttribute('trigger') || DEFAULT_TRIGGER,
      })
    },
    onBreak: () => appendText('\n'),
  })

  return tokens
}

/**
 * Plain text of a mention HTML value: chips render as `${trigger}${label}`,
 * or through `chipText` for custom output.
 */
export function mentionHtmlToText(html: string, options?: MentionHtmlToTextOptions): string {
  return parseMentionHtml(html)
    .map((token) =>
      token.type === 'text'
        ? token.text
        : (options?.chipText?.(token) ?? `${token.trigger}${token.label}`),
    )
    .join('')
}
