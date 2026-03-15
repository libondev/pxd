import { onBeforeUnmount, onMounted, shallowRef } from 'vue'
import { cachedOn } from '../utils/event'
import { isServer } from '../utils/is'

export function useClientOnline() {
  const isOnline = shallowRef(isServer() ? true : navigator.onLine)

  function toggle() {
    isOnline.value = navigator.onLine
  }

  let cleanOnline: () => void
  let cleanOffline: () => void

  onMounted(() => {
    cleanOnline = cachedOn(window, 'online', toggle)
    cleanOffline = cachedOn(window, 'offline', toggle)
  })

  onBeforeUnmount(() => {
    cleanOnline?.()
    cleanOffline?.()
  })

  return isOnline
}
