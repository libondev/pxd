export type ChangeSource = 'user' | 'programmatic' | 'agent'

export interface ChangeDetails {
  /** Absent when the component cannot tell what caused the change. */
  source?: ChangeSource
  /** Why it changed, like `'item-press'`. */
  reason?: string
  /** Refuses the write. Only present on components that own the write. */
  cancel?: () => void
  /** Whether `cancel()` was called. */
  readonly canceled: boolean
}
