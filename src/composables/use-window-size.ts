import { onScopeDispose, onMounted, shallowRef } from 'vue'
import { cachedOn, cachedOff } from '../utils/event.js'
import { isServer } from '../utils/is.js'

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

  onScopeDispose(() => {
    cachedOff(window, 'resize', updateSize)
    cachedOff(window, 'orientationchange', updateSize)
  })

  return {
    width,
    height,
  }
}
