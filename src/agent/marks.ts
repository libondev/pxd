// What an app writes on its own elements to hold an agent back: `data-agent-confirm`
// asks a person first, `data-agent-secret` lets it write but never read, and
// `data-agent-hidden` keeps a region out of the snapshot entirely.

const secretField = /^(password|current-password|new-password|one-time-code|cc-[a-z-]+)$/i

export const REDACTED = '[redacted]'

export function confirmOf(el: Element | null | undefined): string | undefined {
  return (
    el?.closest('[data-agent-confirm]')?.getAttribute('data-agent-confirm')?.trim() || undefined
  )
}

export function isHidden(el: Element | null | undefined): boolean {
  return !!el?.closest('[data-agent-hidden]')
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
