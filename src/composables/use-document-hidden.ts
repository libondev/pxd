import { onBeforeUnmount, onMounted, shallowRef } from 'vue'
import { cachedOn } from '../utils/event'

export function useDocumentHidden() {
  const isHidden = shallowRef<boolean>(document.hidden)

  function toggle() {
    isHidden.value = document.hidden
  }

  let clean: () => void

  onMounted(() => {
    clean = cachedOn(document, 'visibilitychange', toggle)
  })

  onBeforeUnmount(() => {
    clean?.()
  })

  return isHidden
}
