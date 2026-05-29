import { describe, expect, it, vi, beforeEach, afterEach } from 'vite-plus/test'
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
})
