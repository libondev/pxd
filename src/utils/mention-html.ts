import type { MentionHtmlToTextOptions, MentionHtmlToken } from '../components/mention/types'
import { DEFAULT_TRIGGER, getMentionLabel, walkMentionTree } from './_internal/mention-html.js'

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
