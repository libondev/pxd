import type { ChangeDetails } from '../../types/shared/change'

export interface CountdownProps {
  /**
   * Whether to enable count up mode.
   * @default false
   */
  countUp?: boolean
  /**
   * Whether the countdown is running.
   * @default false
   */
  enabled?: boolean
  /**
   * The start time of the countdown.
   */
  startAt?: number
  /**
   * The end time of the countdown.
   * @default 0
   */
  endTime?: number
  /**
   * Whether to automatically reset.
   * @default true
   */
  autoReset?: boolean
  /**
   * The duration of the countdown, in milliseconds.
   * @default 0
   */
  duration?: number
  /**
   * Whether to enable human-friendly time display (ceil to seconds).
   * @default false
   */
  intuitive?: boolean
  /**
   * dayjs duration format of the rendered value.
   * @default 'HH:mm:ss'
   */
  format?: string
}

export interface CountdownEmits {
  change: [enabled: boolean, details: ChangeDetails]
  reset: []
  finish: []
}
