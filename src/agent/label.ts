// The name a person would read for the component, so a step can find it by that name.
export function accessibleName(el: Element | null | undefined): string | undefined {
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
      .map((entry) => entry.textContent?.trim())
      .filter(Boolean)
      .join(' ')

    if (text) {
      return text
    }
  }

  const own = el.closest('label')?.textContent?.trim()

  if (own) {
    return own
  }

  const text = (target: Element) => (target.textContent ?? '').replace(/\s+/g, ' ').trim()

  if (el.matches('button, [role="button"]')) {
    return text(el) || undefined
  }

  // A component whose face is one button, like a more/less toggle, is named by that button.
  const button = el.querySelector('button, [role="button"]')

  return button ? accessibleName(button) : undefined
}
