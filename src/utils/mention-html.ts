import type { MentionHtmlToTextOptions, MentionHtmlToken } from '../components/mention/types'
import {
  BLOCK_TAGS,
  DEFAULT_TRIGGER,
  getMentionLabel,
  isMentionElement,
  MENTION_TAG_LOWER,
} from './_internal/mention-html.js'

export type { MentionHtmlToken, MentionHtmlToTextOptions } from '../components/mention/types'
export { escapePlainTextAsHtml } from './_internal/mention-html.js'

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

  function walk(node: Node) {
    if (node.nodeType === Node.TEXT_NODE) {
      // Same normalization the editor applies on serialize: NBSP glue back to a
      // plain space, the caret anchor never reaches the public value.
      appendText((node.textContent ?? '').replace(/\u00A0/g, ' ').replace(/\u200B/g, ''))
      return
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return
    }

    const el = node as HTMLElement

    if (isMentionElement(el)) {
      tokens.push({
        type: 'mention',
        key: el.getAttribute('key') ?? '',
        label: getMentionLabel(el),
        trigger: el.getAttribute('trigger') || DEFAULT_TRIGGER,
      })
      return
    }

    if (el.tagName === 'BR') {
      appendText('\n')
      return
    }

    if (BLOCK_TAGS.has(el.tagName) && (el.textContent || el.querySelector(MENTION_TAG_LOWER))) {
      if (tokens.length && tokens[tokens.length - 1].type === 'mention') {
        tokens.push({ type: 'text', text: '\n' })
      } else {
        const last = tokens[tokens.length - 1]

        if (last?.type === 'text' && !last.text.endsWith('\n')) {
          last.text += '\n'
        }
      }
    }

    for (const child of Array.from(el.childNodes)) {
      walk(child)
    }
  }

  for (const child of Array.from(doc.body.childNodes)) {
    walk(child)
  }

  return tokens
}

/**
 * Plain text of a mention HTML value: chips render as `${trigger}${label}`,
 * or through `chipText` for custom output.
 */
export function mentionHtmlToText(
  html: string,
  options?: MentionHtmlToTextOptions,
): string {
  return parseMentionHtml(html)
    .map((token) =>
      token.type === 'text'
        ? token.text
        : options?.chipText?.(token) ?? `${token.trigger}${token.label}`,
    )
    .join('')
}