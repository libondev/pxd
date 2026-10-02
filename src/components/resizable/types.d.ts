import type { ComponentDirection } from '../../types/shared'

export interface ResizableProps {
  direction?: ComponentDirection
  /**
   * Per-panel floors as percentages. The group always sums to 100, so one panel's
   * floor is the other panel's ceiling: `[20, 40]` means leading 20-60 and
   * trailing 40-80. Adding up to more than 100 leaves no split that fits, so the
   * constraint is ignored.
   */
  minSize?: number[]
  /** Draw the grip in the middle of the handle. */
  handle?: boolean
  /** Stop the handle from dragging or folding. */
  disabled?: boolean
  /** Starting sizes when uncontrolled. Read once, on setup. */
  defaultValue?: number[]
  modelValue?: number[] | null
}

export interface ResizableEmits {
  change: [number[]]
  reset: [number[]]
  'update:modelValue': [number[]]
}
