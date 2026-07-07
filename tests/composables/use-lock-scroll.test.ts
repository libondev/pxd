import { describe, expect, it } from 'vite-plus/test'
import { useLockScroll } from '../../src/composables/use-lock-scroll'
import { runWithScope } from '../helpers/setup'

describe('useLockScroll', () => {
  it('should return expected API', () => {
    const { result, stop } = runWithScope(() => useLockScroll())
    const { isLocked, lockScroll, unlockScroll } = result

    expect(typeof isLocked).toBe('function')
    expect(typeof lockScroll).toBe('function')
    expect(typeof unlockScroll).toBe('function')
    stop()
  })

  it('should not be locked by default', () => {
    const { result, stop } = runWithScope(() => useLockScroll())
    const { isLocked } = result

    expect(isLocked()).toBe(false)
    stop()
  })

  it('should be locked after lockScroll', () => {
    const { result, stop } = runWithScope(() => useLockScroll())
    const { isLocked, lockScroll } = result

    lockScroll()
    expect(isLocked()).toBe(true)
    stop()
  })
})
