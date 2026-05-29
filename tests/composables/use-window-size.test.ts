import { describe, expect, it } from 'vite-plus/test'
import { defineComponent, h, createApp } from 'vue'
import { useWindowSize } from '../../src/composables/use-window-size'

describe('useWindowSize', () => {
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

  it('should return width and height refs', () => {
    const { width, height, unmount } = withSetup(() => useWindowSize())

    expect(width.value).toBeGreaterThan(0)
    expect(height.value).toBeGreaterThan(0)
    unmount()
  })

  it('should update on resize', () => {
    const { width, unmount } = withSetup(() => useWindowSize())

    Object.defineProperty(window, 'innerWidth', { value: 500, configurable: true })
    window.dispatchEvent(new Event('resize'))

    expect(width.value).toBe(500)
    unmount()
  })

  it('should update on orientationchange', () => {
    const { height, unmount } = withSetup(() => useWindowSize())

    Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true })
    window.dispatchEvent(new Event('orientationchange'))

    expect(height.value).toBe(800)
    unmount()
  })
})
