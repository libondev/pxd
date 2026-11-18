// What an app writes on its own elements to hold an agent back: `data-agent-confirm`
// asks a person first, `data-agent-secret` lets it write but never read, and
// `data-agent-hidden` keeps a region out of the snapshot entirely.

const secretField = /^(password|current-password|new-password|one-time-code|cc-[a-z-]+)$/i

export const REDACTED = '[redacted]'

/** The marks the bridge reads, so a misspelled one can be reported. */
export const MARKS = new Set([
  'data-agent-confirm',
  'data-agent-hidden',
  'data-agent-secret',
  'data-agent-source',
])

export function confirmOf(el: Element | null | undefined): string | undefined {
  return (
    el?.closest('[data-agent-confirm]')?.getAttribute('data-agent-confirm')?.trim() || undefined
  )
}

// What an element a step touches says about itself: a mark on it or around it first, since
// that covers the region it sits in, else the first one inside it, which is where a choice's
// slot renders the sentence about that choice.
export function confirmOn(el: Element | null | undefined): string | undefined {
  return (
    confirmOf(el) ??
    el?.querySelector('[data-agent-confirm]')?.getAttribute('data-agent-confirm')?.trim() ??
    undefined
  )
}

// Whether the element shows at all: out of a hidden region, out of a closed `<details>`
// that is not its summary, off the accessibility tree, and not hidden by its own styles.
export function isHidden(el: Element | null | undefined): boolean {
  if (!el) {
    return false
  }

  if (el.closest('[data-agent-hidden]') || el.closest('[aria-hidden="true"]')) {
    return true
  }

  const closed = el.closest('details:not([open])')

  if (closed && closed !== el && !closed.querySelector(':scope > summary')?.contains(el)) {
    return true
  }

  const view = el as Element & { checkVisibility?: () => boolean }

  // A detached subtree, as a test mounts one, has no styles to hide it.
  return el.isConnected && typeof view.checkVisibility === 'function' && !view.checkVisibility()
}

export function isSecret(el: Element | null | undefined): boolean {
  if (!el) {
    return false
  }

  if (el.closest('[data-agent-secret]')) {
    return true
  }

  const field = el.matches('input, textarea') ? el : el.querySelector('input, textarea')

  if (!field) {
    return false
  }

  const type = field.getAttribute('type') ?? ''

  return type === 'password' || secretField.test(field.getAttribute('autocomplete') ?? '')
}

/** Where the app writes a component, when it says so, so a model can point at its code. */
export function sourceOf(el: Element | null | undefined): string | undefined {
  return el?.closest('[data-agent-source]')?.getAttribute('data-agent-source')?.trim() || undefined
}
