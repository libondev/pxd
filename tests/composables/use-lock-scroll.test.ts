import { describe, expect, it } from 'vite-plus/test'
import { useLockScroll } from '../../src/composables/use-lock-scroll'

describe('useLockScroll', () => {
  it('should return expected API', () => {
    const { isLocked, lockScroll, unlockScroll } = useLockScroll()

    expect(typeof isLocked).toBe('function')
    expect(typeof lockScroll).toBe('function')
    expect(typeof unlockScroll).toBe('function')
  })

  it('should not be locked by default', () => {
    const { isLocked } = useLockScroll()

    expect(isLocked()).toBe(false)
  })

  it('should be locked after lockScroll', () => {
    const { isLocked, lockScroll } = useLockScroll()

    lockScroll()
    expect(isLocked()).toBe(true)
  })
})
