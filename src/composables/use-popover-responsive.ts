import { computed } from 'vue'
import { PRESET_MEDIA_QUERIES, useMediaQuery } from './use-media-query'

export function usePopoverResponsive() {
  const isAdaptive = useMediaQuery(PRESET_MEDIA_QUERIES.IS_XS)

  const responsiveClasses = computed(() => {
    const basicContentClass = 'bg-background-100 border'

    if (isAdaptive.value) {
      return {
        contentClass: `${basicContentClass} w-full rounded-tl-xl rounded-tr-xl`,
        wrapperClass: 'fixed w-screen h-screen items-end pointer-events-none pxd-container-mask',
      } as const
    }

    return {
      contentClass: `${basicContentClass} rounded-xl`,
      wrapperClass: '',
    } as const
  })

  return {
    isAdaptive,
    responsiveClasses,
  }
}
