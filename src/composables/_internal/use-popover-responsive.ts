import { computed } from 'vue'
import { PRESET_MEDIA_QUERIES, useMediaQuery } from '../use-media-query.js'

const ADAPTIVE_CLASSES = {
  content: 'bg-background-100 shadow-border-menu w-full rounded-tl-xl rounded-tr-xl',
  wrapper: 'fixed w-full h-full items-end pointer-events-none',
} as const

const DEFAULT_CLASSES = {
  content: 'bg-background-100 shadow-border-menu rounded-xl',
  wrapper: '',
} as const

export function usePopoverResponsive() {
  const isAdaptive = useMediaQuery(PRESET_MEDIA_QUERIES.IS_XS)

  const responsiveClasses = computed(() => (isAdaptive.value ? ADAPTIVE_CLASSES : DEFAULT_CLASSES))

  return {
    isAdaptive,
    responsiveClasses,
  }
}
