// The text a person reads, without what a screen reader skips or the app hides from
// agents: an icon's `aria-hidden` label, a region marked `data-agent-hidden`.
export function textOf(el: Element | null | undefined): string {
  if (!el) {
    return ''
  }

  let text = ''

  const walk = (node: Node) => {
    for (const child of node.childNodes) {
      if (child.nodeType === 3) {
        text += child.textContent
      } else if (
        child instanceof Element &&
        child.getAttribute('aria-hidden') !== 'true' &&
        !child.hasAttribute('data-agent-hidden')
      ) {
        walk(child)
      }
    }
  }

  walk(el)

  return text.replace(/\s+/g, ' ').trim()
}

// The name a person would read for the component, so a step can find it by that name.
// `namedBy` names the part a component says it is: nothing by default, so a container is never
// named after a button in its content.
export function accessibleName(
  el: Element | null | undefined,
  namedBy: 'none' | 'button' | 'field' = 'none',
): string | undefined {
  if (!el) {
    return
  }

  const labelledBy = el.getAttribute('aria-labelledby')

  if (labelledBy) {
    const doc = el.ownerDocument
    const text = labelledBy
      .split(/\s+/)
      .map((id) => doc.getElementById(id)?.textContent?.trim())
      .filter(Boolean)
      .join(' ')

    if (text) {
      return text
    }
  }

  const label = el.getAttribute('aria-label')?.trim()

  if (label) {
    return label
  }

  const labels = (el as HTMLInputElement).labels

  if (labels?.length) {
    const text = [...labels]
      .map((entry) => textOf(entry))
      .filter(Boolean)
      .join(' ')

    if (text) {
      return text
    }
  }

  const own = el.closest('label')

  if (own) {
    const text = textOf(own)

    if (text) {
      return text
    }
  }

  // A section named by the line a person clicks to open it.
  const summary = el.matches('details') ? el.querySelector(':scope > summary') : undefined

  if (summary) {
    const text = textOf(summary)

    if (text) {
      return text
    }
  }

  if (el.matches('button, [role="button"]')) {
    return textOf(el) || undefined
  }

  if (namedBy === 'none') {
    return undefined
  }

  // A component whose face is one button, like a more/less toggle, is named by that button.
  if (namedBy === 'button') {
    const button = el.querySelector('button, [role="button"]')

    return button ? accessibleName(button) : undefined
  }

  // A wrapper whose name lives on the field it renders, like a date picker's input.
  const field = el.querySelector('input, textarea, select')

  return field ? accessibleName(field) : undefined
}
