import type { ComponentPublicInstance } from 'vue'

export interface ScrollProgressProps {
  scrollTarget?: string | HTMLElement | ComponentPublicInstance | null
}

export interface ScrollProgressEmits {
  change: [percentage: number]
}
