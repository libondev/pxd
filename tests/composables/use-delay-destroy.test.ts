import { describe, expect, it, vi, beforeEach, afterEach } from 'vite-plus/test'
import { defineComponent, h, createApp } from 'vue'
import { useDelayDestroy } from '../../src/composables/use-delay-destroy'

describe('useDelayDestroy', () => {
  function withSetup(setup: () => any) {
    let result: any
    const app = createApp(
      defineComponent({
        setup() {
          result = setup()
          return () => h('div')
        },
      }),
    )
    const el = document.createElement('div')
    app.mount(el)
    return { ...result, unmount: () => app.unmount() }
  }

  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return render and visible refs', () => {
    const { render, visible, show, hide, unmount } = withSetup(() =>
      useDelayDestroy(false, { delay: 300 }),
    )

    expect(render).toBeDefined()
    expect(visible).toBeDefined()
    expect(typeof show).toBe('function')
    expect(typeof hide).toBe('function')
    unmount()
  })

  it('should default to hidden state', () => {
    const { render, visible, unmount } = withSetup(() => useDelayDestroy(false, { delay: 300 }))

    expect(render.value).toBe(false)
    expect(visible.value).toBe(false)
    unmount()
  })
})
