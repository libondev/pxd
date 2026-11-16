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

  return el.closest('label')?.textContent?.trim() || undefined
}
