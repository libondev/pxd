/**
 * Who caused the change. A component can name a person's interaction — it holds the event
 * that started it — and the bridge names an agent's step. A write with neither reports
 * `'programmatic'` only when the caller says so, and no source at all when it says nothing.
 */
export type ChangeSource = 'user' | 'agent' | 'programmatic'

/** Why a value changed, from a closed list, so a consumer can rely on the word. */
export type ChangeReason =
  | 'typed'
  | 'cleared'
  | 'item-press'
  | 'trigger-press'
  | 'escape-key'
  | 'outside-press'
  | 'close-press'
  | 'step'
  | 'settle'
  | 'api'
  | 'sync'

/** What a write says about itself: why it happened, and the event that caused it, if any. */
export interface ChangeAt {
  reason: ChangeReason
  event?: Event
}

export interface ChangeDetails {
  /** Who changed it, when the write can say. */
  source?: ChangeSource
  /** Why it changed, when the write names a reason. */
  reason?: string
  /** Refuses the write. Only present on components that own the write. */
  cancel?: () => void
  /** Whether `cancel()` was called. */
  readonly canceled: boolean
}
