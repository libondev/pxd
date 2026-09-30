const MENTION_TAG = 'AT'
const BLOCK_TAGS = new Set(['DIV', 'P', 'LI', 'PRE'])

/**
 * A collapsed selection sitting right after a `contenteditable=false` element is
 * not representable; Android resolves it *into* the element, the IME then finds
 * no editable context and hides the keyboard. A zero-width space after every chip
 * gives the caret a real text node to live in. It is stripped on serialize, so it
 * never reaches the public HTML, the v-model or the server.
 */
export const CARET_ANCHOR = '\u200B'

export function createCaretAnchor(): Text {
  return document.createTextNode(CARET_ANCHOR)
}

export function isMentionElement(node: Node | null | undefined): boolean {
  return !!node && node.nodeType === Node.ELEMENT_NODE && (node as Element).tagName === MENTION_TAG
}

/**
 * Every chip in `root`. Pressing Enter nests content in block elements, so the
 * editor's direct children are not enough.
 */
export function queryMentionElements(root: ParentNode): HTMLElement[] {
  return Array.from(root.querySelectorAll(MENTION_TAG)) as HTMLElement[]
}

export function getMentionLabel(el: HTMLElement): string {
  const text = el.textContent ?? ''
  return text.startsWith('@') ? text.slice(1) : text
}

export function createMentionElement(key: string, label: string): HTMLElement {
  const el = document.createElement('at')
  el.setAttribute('key', key)
  el.setAttribute('contenteditable', 'false')
  el.className = 'pxd-mention--at'
  el.textContent = `@${label}`
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
  return escapeMentionText(text).replace(/\n/g, '<br>')
}

/**
 * Serialize an editor DOM tree into the public HTML contract:
 * plain text + `<at key="...">label</at>` only.
 */
export function serializeMentionHtml(root: HTMLElement): string {
  let result = ''

  /** Start a block's content on its own line, unless it already is on one. */
  function startLine() {
    if (result && !result.endsWith('\n')) {
      result += '\n'
    }
  }

  function walk(node: Node) {
    if (node.nodeType === Node.TEXT_NODE) {
      // Normalize insert glue NBSP so the public HTML keeps ordinary spaces,
      // and drop the caret anchor so it never reaches the public HTML.
      result += (node.textContent ?? '').replace(/\u00A0/g, ' ').replace(/\u200B/g, '')
      return
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return
    }

    const el = node as HTMLElement

    if (isMentionElement(el)) {
      const key = el.getAttribute('key') ?? ''
      const label = getMentionLabel(el)
      result += `<at key="${escapeMentionAttr(key)}">${escapeMentionText(label)}</at>`
      return
    }

    if (el.tagName === 'BR') {
      result += '\n'
      return
    }

    // Pressing Enter makes the browser wrap content in its own block elements;
    // nothing in this component creates them. A block only needs a line of its
    // own when it carries content — an empty one is already just its <br>.
    if (BLOCK_TAGS.has(el.tagName) && (el.textContent || el.querySelector(MENTION_TAG))) {
      startLine()
    }

    for (const child of Array.from(el.childNodes)) {
      walk(child)
    }
  }

  for (const child of Array.from(root.childNodes)) {
    walk(child)
  }

  // The editor keeps a single <br> so an empty field still has a line box. That
  // placeholder is not a line break, so an empty value stays empty.
  return result === '\n' ? '' : result
}

/**
 * Build a DocumentFragment from public mention HTML (text + legal `<at>` only).
 */
function parseMentionHtml(html: string): DocumentFragment {
  const fragment = document.createDocumentFragment()

  if (!html) {
    return fragment
  }

  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html')
  appendSanitizedChildren(doc.body, fragment)
  return fragment
}

/**
 * Paste sanitizer: keep legal `<at key>` nodes; everything else becomes text.
 */
export function sanitizeMentionClipboardHtml(html: string): DocumentFragment {
  const fragment = document.createDocumentFragment()
  const doc = new DOMParser().parseFromString(html, 'text/html')
  appendSanitizedChildren(doc.body, fragment)
  return fragment
}

function appendSanitizedChildren(source: Node, target: Node) {
  for (const child of Array.from(source.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE) {
      const text = child.textContent ?? ''
      if (text) {
        appendPlainText(target, text)
      }
      continue
    }

    if (child.nodeType !== Node.ELEMENT_NODE) {
      continue
    }

    const el = child as HTMLElement

    if (isMentionElement(el)) {
      const key = el.getAttribute('key')
      if (key != null && key !== '') {
        target.appendChild(createMentionElement(key, getMentionLabel(el)))
        // The anchor merges into the text node that follows, so the chip keeps an
        // editable node on its right without splitting the surrounding text.
        target.appendChild(createCaretAnchor())
        continue
      }
    }

    if (el.tagName === 'BR') {
      target.appendChild(document.createElement('br'))
      continue
    }

    appendSanitizedChildren(el, target)
  }
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
  root.appendChild(parseMentionHtml(html))

  if (!root.childNodes.length) {
    root.appendChild(document.createElement('br'))
  }
}
