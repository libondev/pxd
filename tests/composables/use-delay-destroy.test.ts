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

  it('should settle hide() even when the node is already destroyed', async () => {
    const { hide, render, unmount } = withSetup(() => useDelayDestroy(false, { delay: 300 }))

    // render is already false: hide() must still resolve per its contract.
    const pending = hide()
    await vi.advanceTimersByTimeAsync(300)
    await expect(pending).resolves.toBe(false)
    expect(render.value).toBe(false)

    unmount()
  })

  it('should settle hide() after the destroy delay when visible', async () => {
    const { show, hide, render, unmount } = withSetup(() => useDelayDestroy(false, { delay: 300 }))

    void show()
    await vi.advanceTimersByTimeAsync(64)
    expect(render.value).toBe(true)

    const pending = hide()
    expect(render.value).toBe(true)

    await vi.advanceTimersByTimeAsync(300)
    await expect(pending).resolves.toBe(false)
    expect(render.value).toBe(false)

    unmount()
  })

  it('should not fire renderChange when hide() runs on an already hidden node', async () => {
    const renderChange = vi.fn()
    const { hide, unmount } = withSetup(() => useDelayDestroy(false, { delay: 300, renderChange }))

    void hide()
    await vi.advanceTimersByTimeAsync(300)

    expect(renderChange).not.toHaveBeenCalled()

    unmount()
  })

  it('should fire renderChange once when hide() destroys a rendered node', async () => {
    const renderChange = vi.fn()
    const { show, hide, unmount } = withSetup(() =>
      useDelayDestroy(false, { delay: 300, renderChange }),
    )

    void show()
    await vi.advanceTimersByTimeAsync(64)
    renderChange.mockClear()

    void hide()
    await vi.advanceTimersByTimeAsync(300)

    expect(renderChange).toHaveBeenCalledTimes(1)
    expect(renderChange).toHaveBeenCalledWith(false)

    unmount()
  })
})
