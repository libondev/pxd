import type { ChangeDetails, ChangeSource } from '../../types/shared/change'

interface ChangeCause {
  source?: ChangeSource
  reason?: string
}

// The cause of the change being dispatched, read by the emits it flows through,
// so a call like an agent's tags its changes without every call site naming it.
let cause: ChangeCause | undefined

export function withChangeDetails<T>(next: ChangeCause, run: () => T): T {
  const outer = cause
  cause = next

  try {
    return run()
  } finally {
    cause = outer
  }
}

export function changeDetails(reason?: string): ChangeDetails {
  return {
    source: cause?.source,
    reason: reason ?? cause?.reason,
    canceled: false,
  }
}

export function cancelableChangeDetails(reason?: string): ChangeDetails {
  let canceled = false
  const details = changeDetails(reason)

  return {
    ...details,
    cancel: () => {
      canceled = true
    },
    get canceled() {
      return canceled
    },
  }
}
