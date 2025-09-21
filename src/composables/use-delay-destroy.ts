import type { MaybeRefOrGetter, Ref } from 'vue'
import { shallowRef } from 'vue'
import { toValue } from '../utils/ref'

interface Options {
  delay?: number
  renderChange?: (v: boolean) => void
  visibleChange?: (v: boolean) => void
}

interface Results {
  render: Ref<boolean>
  visible: Ref<boolean>
  show: () => Promise<boolean>
  hide: () => Promise<boolean>
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

  let destroyTimeoutId: ReturnType<typeof setTimeout>
  let visibleTimeoutId: ReturnType<typeof setTimeout>

  async function show() {
    return new Promise<boolean>((resolve) => {
      clearTimeout(destroyTimeoutId)

      if (!render.value) {
        render.value = true
        renderChange?.(render.value)
      }

      if (!visible.value) {
        clearTimeout(visibleTimeoutId)
        visibleTimeoutId = setTimeout(() => {
          visible.value = true
          resolve(visible.value)
          visibleChange?.(visible.value)
        }, 0)
      }
    })
  }

  function hide() {
    return new Promise<boolean>((resolve) => {
      clearTimeout(visibleTimeoutId)

      if (visible.value) {
        visible.value = false
        visibleChange?.(visible.value)
      }

      if (render.value) {
        clearTimeout(destroyTimeoutId)
        destroyTimeoutId = setTimeout(() => {
          render.value = false
          resolve(render.value)
          renderChange?.(render.value)
        }, delay)
      }
    })
  }

  return {
    show,
    hide,
    render,
    visible,
  }
}
