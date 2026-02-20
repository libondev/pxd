import { onBeforeUnmount, onMounted, shallowRef } from 'vue'

import type { Callback } from '../types/shared'
import { cachedOn } from '../utils/event'
import { isServer } from '../utils/is'

export function useDocumentHidden(callback?: Callback) {
  const isHidden = shallowRef<boolean>(isServer() ? false : document.hidden)

  function toggle() {
    isHidden.value = document.hidden
    callback?.(isHidden.value)
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
