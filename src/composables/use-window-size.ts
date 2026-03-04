import { onBeforeUnmount, onMounted, shallowRef } from 'vue'

import { cachedOn, cachedOff } from '../utils/event'
import { isServer } from '../utils/is'

export function useWindowSize() {
  const width = shallowRef(0)
  const height = shallowRef(0)

  const updateSize = () => {
    width.value = window.innerWidth
    height.value = window.innerHeight
  }

  onMounted(() => {
    if (isServer()) {
      return
    }

    updateSize()
    cachedOn(window, 'resize', updateSize)
    cachedOn(window, 'orientationchange', updateSize)
  })

  onBeforeUnmount(() => {
    cachedOff(window, 'resize', updateSize)
    cachedOff(window, 'orientationchange', updateSize)
  })

  return {
    width,
    height,
  }
}
