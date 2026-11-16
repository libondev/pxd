/**
 * Who caused the change. An agent step is the only cause a component can name today:
 * nothing tags a person's input yet, so a change a person made reports no source rather
 * than guessing one. A direction that cannot be trusted is worse than one that is absent.
 */
export type ChangeSource = 'agent'

export interface ChangeDetails {
  /** `'agent'` when a bridge step made the change; absent when nothing named a cause. */
  source?: ChangeSource
  /** Why it changed, like `'item-press'`. */
  reason?: string
  /** Refuses the write. Only present on components that own the write. */
  cancel?: () => void
  /** Whether `cancel()` was called. */
  readonly canceled: boolean
}
