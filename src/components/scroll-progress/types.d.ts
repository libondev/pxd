import type { ChangeDetails, ChangeReason } from '../../types/shared/change'
import type { ComponentPublicInstance } from 'vue'

export type ScrollProgressChangeReason = Extract<ChangeReason, 'sync'>

export interface ScrollProgressProps {
  scrollTarget?: string | HTMLElement | ComponentPublicInstance | null
}

export interface ScrollProgressEmits {
  change: [percentage: number, details: ChangeDetails<ScrollProgressChangeReason>]
}
