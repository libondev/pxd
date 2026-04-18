import { computed } from 'vue'
import { PRESET_MEDIA_QUERIES, useMediaQuery } from './use-media-query'

export function usePopoverResponsive() {
  const isAdaptive = useMediaQuery(PRESET_MEDIA_QUERIES.IS_XS)

  const responsiveClasses = computed(() => {
    if (isAdaptive.value) {
      return {
        content: `bg-background-100 shadow-border-menu w-full rounded-tl-xl rounded-tr-xl`,
        wrapper: 'fixed w-screen h-screen items-end pointer-events-none pxd-container-mask',
      } as const
    }

    return {
      content: `bg-background-100 shadow-border-menu rounded-xl`,
      wrapper: '',
    } as const
  })

  return {
    isAdaptive,
    responsiveClasses,
  }
}
