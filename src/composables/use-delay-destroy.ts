import type { Ref } from 'vue'
import { nextTick, shallowRef } from 'vue'

interface Options {
  default?: boolean
  delay?: number
}

interface UseDelayDestroyReturnType {
  render: Ref<boolean>
  visible: Ref<boolean>
  open: () => Promise<boolean>
  close: () => Promise<boolean>
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

  const open = async () => {
    return new Promise<boolean>((resolve) => {
      clearTimeout(delayTimeoutId)

      render.value = true

      nextTick().then(() => {
        resolve(visible.value = true)
      })
    })
  }

  const close = () => {
    return new Promise<boolean>((resolve) => {
      visible.value = false

      delayTimeoutId = setTimeout(() => {
        resolve(render.value = false)
      }, delay)
    })
  }

  return {
    open,
    close,
    render,
    visible,
  }
}
