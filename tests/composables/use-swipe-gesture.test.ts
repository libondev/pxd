import { describe, expect, it } from 'vite-plus/test'
import { useSwipeGesture } from '../../src/composables/use-swipe-gesture'

describe('useSwipeGesture', () => {
  it('should export useSwipeGesture as a function', () => {
    expect(typeof useSwipeGesture).toBe('function')
  })
})
