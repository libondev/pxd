import type { MaybeRefOrGetter, Ref } from 'vue'
import { nextTick, shallowRef } from 'vue'
import { toValue } from '../utils/ref'

interface Options {
  delay?: number
  renderChange?: (v: boolean) => void
  visibleChange?: (v: boolean) => void
}

interface Results {
  render: Ref<boolean>
  visible: Ref<boolean>
  open: () => Promise<boolean>
  close: () => Promise<boolean>
}

export function useDelayDestroy(
  value: MaybeRefOrGetter<boolean>,
  options: Options = {},
): Results {
  const {
    delay = 300,
    renderChange,
    visibleChange,
  } = options

  const render = shallowRef(toValue(value))
  const visible = shallowRef(value as boolean)

  let delayTimeoutId: ReturnType<typeof setTimeout>

  async function open() {
    return new Promise<boolean>((resolve) => {
      clearTimeout(delayTimeoutId)

      render.value = true
      renderChange?.(render.value)

      nextTick().then(() => {
        visible.value = true
        resolve(visible.value)
        visibleChange?.(visible.value)
      })
    })
  }

  function close() {
    return new Promise<boolean>((resolve) => {
      visible.value = false
      visibleChange?.(visible.value)

      delayTimeoutId = setTimeout(() => {
        render.value = false
        resolve(render.value)
        renderChange?.(render.value)
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
