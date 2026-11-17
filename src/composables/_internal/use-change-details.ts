import type { ChangeAt, ChangeDetails, ChangeReason, ChangeSource } from '../../types/shared/change'

interface ChangeCause {
  source?: ChangeSource
  reason?: string
}

// Reasons a person's action produces. A write that names one of these happened in front of
// somebody, even when the handler has no event to hand (a clear button calling clear()).
const INTERACTION_REASONS: ReadonlySet<ChangeReason> = new Set<ChangeReason>([
  'typed',
  'pasted',
  'cleared',
  'item-press',
  'trigger-press',
  'escape-key',
  'outside-press',
  'close-press',
  'step',
  'settle',
])

// The cause of the change being dispatched, read by the emits it flows through, so a call
// like an agent's tags its changes without every call site naming it.
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

// A step that a person caused cannot be faked: the event is theirs. A step with no event is
// only a person's if the reason says so, and claims nothing at all if the write is silent.
export function resolveChangeSource(at?: ChangeAt): ChangeSource | undefined {
  if (cause?.source) {
    return cause.source
  }

  if (at?.event) {
    return 'user'
  }

  if (!at) {
    return undefined
  }

  return INTERACTION_REASONS.has(at.reason) ? 'user' : 'programmatic'
}

export function changeDetails(reason?: string): ChangeDetails {
  return {
    source: cause?.source,
    reason: reason ?? cause?.reason,
    canceled: false,
  }
}

export function changeDetailsFor(at?: ChangeAt): ChangeDetails {
  return {
    source: resolveChangeSource(at),
    reason: at?.reason ?? cause?.reason,
    canceled: false,
  }
}

export function cancelableChangeDetails(reason?: string): ChangeDetails {
  const details = changeDetails(reason)
  let canceled = false

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

export function cancelableChangeDetailsFor(at?: ChangeAt): ChangeDetails {
  const details = changeDetailsFor(at)
  let canceled = false

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
