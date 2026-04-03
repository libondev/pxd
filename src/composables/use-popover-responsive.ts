import { computed } from 'vue'
import { PRESET_MEDIA_QUERIES, useMediaQuery } from './use-media-query'

export function usePopoverResponsive() {
  const isAdaptive = useMediaQuery(PRESET_MEDIA_QUERIES.IS_XS)

  const responsiveClasses = computed(() => {
    if (isAdaptive.value) {
      return {
        contentClass: `bg-background-100 w-full rounded-tl-xl rounded-tr-xl`,
        wrapperClass: 'fixed w-screen h-screen items-end pointer-events-none pxd-container-mask',
      } as const
    }

    return {
      contentClass: `bg-background-100 border rounded-xl`,
      wrapperClass: '',
    } as const
  })

  return {
    isAdaptive,
    responsiveClasses,
  }
}
