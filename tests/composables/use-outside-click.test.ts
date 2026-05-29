import { describe, expect, it, vi, beforeEach, afterEach } from 'vite-plus/test'
import { useOutsideClick } from '../../src/composables/use-outside-click'
import { useSetupWrapper } from '../helpers/setup'

describe('useOutsideClick', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return stop function', () => {
    const container = document.createElement('div')
    const { stop, unmount } = useSetupWrapper(() => useOutsideClick(() => container))

    expect(typeof stop).toBe('function')
    unmount()
  })
})
