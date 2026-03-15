import { computed } from 'vue'
import { PRESET_MEDIA_QUERIES, useMediaQuery } from './use-media-query'

export function usePopoverResponsive() {
  const isXs = useMediaQuery(PRESET_MEDIA_QUERIES.IS_XS)

  const attrs = computed(() => {
    const basicContentClass = 'bg-background-100 border'

    if (isXs.value) {
      return {
        contentClass: `${basicContentClass} w-full rounded-tl-xl rounded-tr-xl`,
        wrapperClass: 'fixed w-screen h-screen items-end pointer-events-none pxd-container-mask',
        transitionType: 'fade-slide',
      } as const
    }

    return {
      contentClass: `${basicContentClass} rounded-xl`,
      wrapperClass: '',
      transitionType: 'fade-scale',
    } as const
  })

  return {
    isXs,
    attrs,
  }
}
