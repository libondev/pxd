const MENTION_TAG = 'AT'

export function isMentionElement(node: Node | null | undefined): boolean {
  return !!node && node.nodeType === Node.ELEMENT_NODE && (node as Element).tagName === MENTION_TAG
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

export function escapeMentionText(text: string): string {
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

  function walk(node: Node) {
    if (node.nodeType === Node.TEXT_NODE) {
      result += node.textContent ?? ''
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

    const isBlock =
      el.tagName === 'DIV' || el.tagName === 'P' || el.tagName === 'LI' || el.tagName === 'PRE'

    if (isBlock && result && !result.endsWith('\n')) {
      result += '\n'
    }

    for (const child of Array.from(el.childNodes)) {
      walk(child)
    }

    if (isBlock && result && !result.endsWith('\n')) {
      const isLast = el === root.lastElementChild || el.nextSibling == null
      if (!isLast) {
        result += '\n'
      }
    }
  }

  for (const child of Array.from(root.childNodes)) {
    walk(child)
  }

  return result.replace(/\n$/, '')
}

/**
 * Build a DocumentFragment from public mention HTML (text + legal `<at>` only).
 */
export function parseMentionHtml(html: string): DocumentFragment {
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
      target.appendChild(document.createTextNode(parts[i]))
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
