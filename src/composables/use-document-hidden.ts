import { onBeforeUnmount, onMounted, shallowRef } from 'vue'
import { cachedOn } from '../utils/event'
import { isServer } from '../utils/is'

export function useDocumentHidden() {
  const isHidden = shallowRef<boolean>(isServer ? false : document.hidden)

  function toggle() {
    isHidden.value = document.hidden
  }

  let cleanHidden: () => void

  onMounted(() => {
    cleanHidden = cachedOn(document, 'visibilitychange', toggle)
  })

  onBeforeUnmount(() => {
    cleanHidden?.()
  })

  return isHidden
}
