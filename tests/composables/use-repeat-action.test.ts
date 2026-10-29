import { describe, expect, it, vi, beforeEach, afterEach } from 'vite-plus/test'
import { ref } from 'vue'
import { useRepeatAction } from '../../src/composables/use-repeat-action'
import { useSetupWrapper } from '../helpers/setup'

describe('useRepeatAction', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return start and stop functions', () => {
    const action = vi.fn()
    const { start, stop, unmount } = useSetupWrapper(() => useRepeatAction(action))

    expect(typeof start).toBe('function')
    expect(typeof stop).toBe('function')
    unmount()
  })

  it('should call action on start', () => {
    const action = vi.fn()
    const { start, unmount } = useSetupWrapper(() => useRepeatAction(action))

    start()
    expect(action).toHaveBeenCalledTimes(1)
    unmount()
  })

  it('should accept options object', () => {
    const action = vi.fn()
    const { start, stop, unmount } = useSetupWrapper(() =>
      useRepeatAction({
        action,
        initialInterval: 100,
        finalInterval: 50,
      }),
    )

    expect(typeof start).toBe('function')
    expect(typeof stop).toBe('function')
    unmount()
  })

  it('should accelerate from scheduled intervals, not wall-clock drift', () => {
    const action = vi.fn()
    const { start, stop, unmount } = useSetupWrapper(() =>
      useRepeatAction({
        action,
        initialInterval: 500,
        finalInterval: 30,
        duration: 1000,
      }),
    )

    start()
    expect(action).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(500)
    expect(action).toHaveBeenCalledTimes(2)

    vi.advanceTimersByTime(264)
    expect(action).toHaveBeenCalledTimes(2)

    vi.advanceTimersByTime(1)
    expect(action).toHaveBeenCalledTimes(3)

    stop()
    unmount()
  })

  it('should ignore start and stop repeating while disabled', () => {
    const action = vi.fn()
    const enabled = ref(false)
    const { start, unmount } = useSetupWrapper(() =>
      useRepeatAction({
        action,
        enabled,
        initialInterval: 100,
        finalInterval: 50,
      }),
    )

    start()
    vi.advanceTimersByTime(500)
    expect(action).not.toHaveBeenCalled()

    enabled.value = true
    start()
    expect(action).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(100)
    enabled.value = false

    vi.advanceTimersByTime(100)
    expect(action).toHaveBeenCalledTimes(2)

    unmount()
  })

  it('should stop repeating after stop()', () => {
    const action = vi.fn()
    const { start, stop, unmount } = useSetupWrapper(() =>
      useRepeatAction({
        action,
        initialInterval: 100,
        finalInterval: 50,
      }),
    )

    start()
    stop()
    vi.advanceTimersByTime(1000)
    expect(action).toHaveBeenCalledTimes(1)
    unmount()
  })
})
