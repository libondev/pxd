import type { Nullable } from '../types/shared/utils'
import type { Ref, MaybeRefOrGetter } from 'vue'
import { onScopeDispose, shallowRef, toValue } from 'vue'
import { caf, raf } from '../utils/event.js'

interface Options {
  delay?: MaybeRefOrGetter<number>
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
  value: MaybeRefOrGetter<Nullable<boolean>>,
  options: Options = {},
): Results {
  const { delay, renderChange, visibleChange } = options

  const render = shallowRef(toValue(value) as boolean)
  const visible = shallowRef(toValue(value) as boolean)

  let destroyTimeoutId: ReturnType<typeof setTimeout>
  let visibleRafId = 0
  const pendingResolvers = new Set<(value: boolean) => void>()

  function settlePending(resolve: (value: boolean) => void, value: boolean) {
    if (pendingResolvers.delete(resolve)) {
      resolve(value)
    }
  }

  function getDelay() {
    return toValue(delay) ?? 1000
  }

  async function show() {
    return new Promise<boolean>((resolve) => {
      clearTimeout(destroyTimeoutId)

      if (!render.value) {
        render.value = true
        renderChange?.(render.value)
      }

      if (visible.value) {
        resolve(visible.value)
        return
      }

      pendingResolvers.add(resolve)
      caf(visibleRafId)
      visibleRafId = raf(() => {
        visibleRafId = raf(() => {
          visibleRafId = 0
          visible.value = true
          settlePending(resolve, visible.value)
          visibleChange?.(visible.value)
        })
      })
    })
  }

  function hide() {
    return new Promise<boolean>((resolve) => {
      caf(visibleRafId)
      visibleRafId = 0

      if (visible.value) {
        visible.value = false
        visibleChange?.(visible.value)
      }

      clearTimeout(destroyTimeoutId)
      pendingResolvers.add(resolve)
      destroyTimeoutId = setTimeout(() => {
        if (render.value) {
          render.value = false
          renderChange?.(render.value)
        }

        settlePending(resolve, render.value)
      }, getDelay())
    })
  }

  onScopeDispose(() => {
    clearTimeout(destroyTimeoutId)
    caf(visibleRafId)

    // `show`/`hide` only resolve from the frame/timer above; without this they stay pending
    // forever and any awaiting caller keeps the whole setup scope alive.
    for (const resolve of pendingResolvers) {
      resolve(false)
    }

    pendingResolvers.clear()
  })

  return {
    show,
    hide,
    render,
    visible,
  }
}
