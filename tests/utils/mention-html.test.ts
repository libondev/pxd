import { describe, expect, it } from 'vite-plus/test'
import {
  createMentionElement,
  getMentionLabel,
  queryMentionElements,
  sanitizeMentionClipboardHtml,
  serializeMentionHtml,
  setMentionEditorContent,
} from '../../src/utils/mention-html'

const ZWSP = '\u200B'

/**
 * The caret anchor (\\u200B) is a load-bearing invariant, not a cosmetic detail.
 *
 * A collapsed selection sitting immediately after a `contenteditable="false"`
 * element is not representable. Chrome on Android resolves such a selection
 * *into* that element; the IME then finds no editable context and hides the soft
 * keyboard, while the editor stays focused. Desktop Blink keeps the position, so
 * this never reproduces there and desktop tests cannot catch it.
 *
 * Giving every chip a zero-width space to its right keeps the caret inside a real
 * text node. The character is stripped on serialize, so it never reaches the
 * public HTML, the v-model or the server.
 */
/** Chips with no editable text node on their right — the failure list is the message. */
function unanchoredChips(root: HTMLElement): string[] {
  return queryMentionElements(root)
    .filter((chip) => {
      const next = chip.nextSibling
      return !next || next.nodeType !== Node.TEXT_NODE || !(next.textContent ?? '').includes(ZWSP)
    })
    .map((chip) => chip.outerHTML)
}

function expectAnchorInvariant(root: HTMLElement) {
  expect(unanchoredChips(root)).toEqual([])
}

function build(html: string): HTMLElement {
  const root = document.createElement('div')
  root.setAttribute('contenteditable', 'true')
  setMentionEditorContent(root, html)
  return root
}

describe('mention-html public contract', () => {
  const roundTrips = [
    'Hello <at key="1">Alice</at>',
    'Hello <at key="1">Alice</at>tail',
    'head <at key="1">A</at>mid <at key="2">B</at>tail',
    '<at key="1">A</at><at key="2">B</at>',
    'first\nsecond',
    'first<at key="1">A</at>\nsecond',
    'plain text only',
  ]

  for (const html of roundTrips) {
    it('round-trips ' + JSON.stringify(html), () => {
      const out = serializeMentionHtml(build(html))
      expect(out).toBe(html)
      // Re-parsing the serialized value must be a fixed point.
      expect(serializeMentionHtml(build(out))).toBe(out)
    })
  }

  it('never leaks the caret anchor into the public HTML', () => {
    for (const html of roundTrips) {
      expect(serializeMentionHtml(build(html))).not.toContain(ZWSP)
    }
  })

  it('normalizes NBSP glue back to a plain space', () => {
    const root = document.createElement('div')
    root.setAttribute('contenteditable', 'true')
    root.innerHTML = 'a\u00A0b'
    expect(serializeMentionHtml(root)).toBe('a b')
  })

  it('escapes label and key text', () => {
    const root = document.createElement('div')
    root.setAttribute('contenteditable', 'true')
    const chip = document.createElement('at')
    chip.setAttribute('key', 'a"b&c')
    chip.setAttribute('contenteditable', 'false')
    chip.textContent = '@<script>'
    root.appendChild(chip)

    const out = serializeMentionHtml(root)
    expect(out).toBe('<at key="a&quot;b&amp;c">&lt;script&gt;</at>')
  })

  it('gives an empty editor a <br> so it keeps a line box', () => {
    const root = build('')
    expect(root.childNodes.length).toBe(1)
    expect(root.firstElementChild?.tagName).toBe('BR')
    expect(serializeMentionHtml(root)).toBe('')
  })
})

describe('caret anchor invariant', () => {
  it('anchors a chip at the end of the content', () => {
    const root = build('Hello <at key="1">A</at>')
    expectAnchorInvariant(root)
    const next = root.querySelector('at')!.nextSibling as Text
    expect(next.textContent).toBe(ZWSP)
  })

  it('merges the anchor into the following text instead of splitting it', () => {
    const root = build('Hello <at key="1">A</at>tail')
    const textNodes = Array.from(root.childNodes).filter((n) => n.nodeType === Node.TEXT_NODE)
    expect(textNodes).toHaveLength(2)
    expect(textNodes[1].textContent).toBe(ZWSP + 'tail')
  })

  it('anchors adjacent chips so a caret can sit between them', () => {
    const root = build('<at key="1">A</at><at key="2">B</at>')
    expectAnchorInvariant(root)
    const between = root.querySelector('at')!.nextSibling as Text
    expect(between.textContent).toBe(ZWSP)
  })

  it('keeps text on both sides of a chip in one node each', () => {
    const root = build('head <at key="1">A</at> tail')
    const textNodes = Array.from(root.childNodes).filter((n) => n.nodeType === Node.TEXT_NODE)
    expect(textNodes.map((n) => n.textContent)).toEqual(['head ', ZWSP + ' tail'])
  })
})

/**
 * Nothing in this component creates block elements, but pressing Enter makes the
 * browser wrap the content in them, so the serializer has to understand them.
 * These are the shapes Blink produces for a plain `contenteditable` div.
 */
describe('block content created by pressing Enter', () => {
  const shapes: [string, string][] = [
    ['a<div>b</div>', 'a\nb'],
    ['<div>a</div><div>b</div>', 'a\nb'],
    ['Hello<div><br></div>', 'Hello\n'],
    ['<div>a</div><div><br></div>', 'a\n'],
    ['<div><br></div><div>a</div>', '\na'],
    ['a<br>b', 'a\nb'],
    ['a<br><br>b', 'a\n\nb'],
    ['a<div>b<div>c</div></div>', 'a\nb\nc'],
  ]

  for (const [dom, expected] of shapes) {
    it('serializes ' + JSON.stringify(dom), () => {
      const root = document.createElement('div')
      root.setAttribute('contenteditable', 'true')
      root.innerHTML = dom
      expect(serializeMentionHtml(root)).toBe(expected)
    })
  }

  it('round-trips a value that ends on a line break', () => {
    expect(serializeMentionHtml(build('a\n'))).toBe('a\n')
    expect(serializeMentionHtml(build('a\n\nb'))).toBe('a\n\nb')
  })

  it('normalizes a lone line break to an empty value', () => {
    // The editor keeps one <br> so an empty field still has a line box, so "" and
    // "\n" are the same DOM. The empty form is the one the contract publishes.
    expect(serializeMentionHtml(build('\n'))).toBe('')
    expect(serializeMentionHtml(build(''))).toBe('')
  })

  it('serializes a chip that Enter pushed into a block', () => {
    const root = document.createElement('div')
    root.setAttribute('contenteditable', 'true')
    root.innerHTML = 'a<div>z<at contenteditable="false" class="pxd-mention--at">@Alice</at></div>'
    expect(serializeMentionHtml(root)).toBe('a\nz<at key="">Alice</at>')
  })

  it('finds chips nested inside blocks, not only direct children', () => {
    const root = document.createElement('div')
    root.setAttribute('contenteditable', 'true')
    root.innerHTML = '<div><at contenteditable="false">@Alice</at>\u200Btail</div>'
    expect(queryMentionElements(root)).toHaveLength(1)
  })
})

describe('chip element and clipboard sanitizing', () => {
  it('creates a non-editable chip carrying its key', () => {
    const chip = createMentionElement('u1', 'Alice')
    expect(chip.tagName).toBe('AT')
    expect(chip.getAttribute('key')).toBe('u1')
    expect(chip.getAttribute('contenteditable')).toBe('false')
    expect(getMentionLabel(chip)).toBe('Alice')
  })

  it('keeps legal chips and strips everything else from pasted html', () => {
    const fragment = sanitizeMentionClipboardHtml(
      '<b onclick="x()">bold</b><at key="1">Alice</at><script>bad()</' +
        'script><img src=x onerror=1>',
    )
    const host = document.createElement('div')
    host.appendChild(fragment)

    expect(host.querySelector('b')).toBeNull()
    expect(host.querySelector('img')).toBeNull()
    expect(host.querySelector('script')).toBeNull()
    expect(host.querySelectorAll('at')).toHaveLength(1)
    expectAnchorInvariant(host)
  })

  it('drops a chip that has no key', () => {
    const host = document.createElement('div')
    host.appendChild(
      sanitizeMentionClipboardHtml('<at>Alice</at><at key="2">Bob</at>'),
    )
    expect(host.querySelectorAll('at')).toHaveLength(1)
    expect(host.querySelector('at')!.getAttribute('key')).toBe('2')
  })

  it('turns pasted newlines into <br> and keeps the invariant', () => {
    const host = document.createElement('div')
    host.appendChild(
      sanitizeMentionClipboardHtml('one\ntwo <at key="1">A</at>'),
    )
    expect(host.querySelector('br')).not.toBeNull()
    expectAnchorInvariant(host)
  })
})
