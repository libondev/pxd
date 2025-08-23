import type { Ref } from 'vue'
import { nextTick, shallowRef } from 'vue'

interface Options {
  default?: boolean
  delay?: number
}

interface UseDelayDestroyReturnType {
  render: Ref<boolean>
  visible: Ref<boolean>
  open: () => void
  close: () => void
}

export function useDelayDestroy(valueOrOptions: boolean | Options = {}): UseDelayDestroyReturnType {
  const {
    delay = 300,
    default: value = false,
  } = typeof valueOrOptions === 'boolean'
    ? { default: valueOrOptions, delay: 300 }
    : valueOrOptions

  const render = shallowRef(value)
  const visible = shallowRef(value)

  let delayTimeoutId: ReturnType<typeof setTimeout>

  const open = () => {
    clearTimeout(delayTimeoutId)

    render.value = true

    nextTick().then(() => {
      visible.value = true
    })
  }

  const close = () => {
    visible.value = false

    delayTimeoutId = setTimeout(() => {
      render.value = false
    }, delay)
  }

  return {
    open,
    close,
    render,
    visible,
  }
}
