import { describe, expect, it, vi, beforeEach, afterEach } from 'vite-plus/test'
import { useFocusTrap } from '../../src/composables/use-focus-trap'
import { useSetupWrapper } from '../helpers/setup'

describe('useFocusTrap', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return stop function', () => {
    const container = document.createElement('div')
    const { stop, unmount } = useSetupWrapper(() => useFocusTrap(() => container))

    expect(typeof stop).toBe('function')
    unmount()
  })
})
