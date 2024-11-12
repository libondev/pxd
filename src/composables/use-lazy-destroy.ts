import { shallowRef } from 'vue'

interface UseLazyDestroyProps {
  initialValue?: boolean
  destroyDelay?: number
}

export function useLazyDestroy({
  initialValue = false,
  destroyDelay = 2000,
}: UseLazyDestroyProps = {}) {
  const render = shallowRef(initialValue)
  const visible = shallowRef(initialValue)

  let renderTimeoutId: number

  function open() {
    render.value = true

    clearTimeout(renderTimeoutId)

    setTimeout(() => {
      visible.value = true
    }, 0)
  }

  function close() {
    visible.value = false

    renderTimeoutId = window.setTimeout(() => {
      render.value = false
    }, destroyDelay)
  }

  return {
    render,
    visible,

    open,
    close,
  }
}
