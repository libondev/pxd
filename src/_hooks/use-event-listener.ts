import { onMounted, onUnmounted } from 'vue'

import { noop } from '../_internal'

export function useEventListener (...args: any[]): typeof noop {
  let target: EventTarget
  let event: string,
    listener: EventListenerOrEventListenerObject,
    options: AddEventListenerOptions | boolean | undefined

  if (typeof args[0] === 'string') {
    [event, listener, options] = args
    target = window
  } else {
    [target, event, listener, options] = args
  }

  if (!target) {
    return noop
  }

  let cleanup = noop

  onMounted(() => {
    target.addEventListener(event, listener, options)

    cleanup = () => {
      target.removeEventListener(event, listener, options)
      cleanup = noop
    }
  })

  onUnmounted(cleanup)

  return cleanup
}
