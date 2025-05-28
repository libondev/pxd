import type { Ref } from 'vue'
import { shallowRef } from 'vue'

interface Options {
  default?: boolean
  delay?: number
}

interface ReturnType {
  render: Ref<boolean>
  visible: Ref<boolean>
  open: () => void
  close: () => void
}

export function useDelayDestroy(valueOrOptions: boolean | Options = {}): ReturnType {
  const {
    delay = 300,
    default: value = false,
  } = typeof valueOrOptions === 'boolean'
    ? { default: valueOrOptions, delay: 300 }
    : valueOrOptions

  const render = shallowRef(value)
  const visible = shallowRef(value)

  let delayTimeoutId = -1

  const open = () => {
    clearTimeout(delayTimeoutId)

    render.value = true

    Promise.resolve().then(() => {
      visible.value = true
    })
  }

  const close = () => {
    visible.value = false

    delayTimeoutId = window.setTimeout(() => {
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
