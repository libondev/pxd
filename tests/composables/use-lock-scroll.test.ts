import { afterEach, describe, expect, it, vi } from 'vite-plus/test'
import { useLockScroll } from '../../src/composables/_internal/use-lock-scroll'
import * as dom from '../../src/utils/dom'
import { runWithScope } from '../helpers/setup'

const rootLockClassNames = ['pointer-events-none', 'scrollbar-gutter-stable', 'scrollbar-disabled']

describe('useLockScroll', () => {
  afterEach(() => {
    document.documentElement.classList.remove(...rootLockClassNames)
    vi.restoreAllMocks()
  })

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

  it('should keep root classes until all instances unlock', () => {
    vi.spyOn(dom, 'hasScrollbar').mockReturnValue({ x: false, y: true })
    vi.spyOn(dom, 'isScrollable').mockReturnValue({ x: false, y: true })

    const first = runWithScope(() => useLockScroll())
    const second = runWithScope(() => useLockScroll())

    first.result.lockScroll()
    second.result.lockScroll()
    first.result.unlockScroll()

    expect(document.documentElement.classList.contains('pointer-events-none')).toBe(true)
    expect(document.documentElement.classList.contains('scrollbar-disabled')).toBe(true)

    second.result.unlockScroll()

    expect(document.documentElement.classList.contains('pointer-events-none')).toBe(false)
    expect(document.documentElement.classList.contains('scrollbar-gutter-stable')).toBe(false)
    expect(document.documentElement.classList.contains('scrollbar-disabled')).toBe(false)

    first.stop()
    second.stop()
  })

  it('should release all locks owned by a scope when it is disposed', () => {
    const { result, stop } = runWithScope(() => useLockScroll())

    result.lockScroll()
    result.lockScroll()
    stop()

    expect(document.documentElement.classList.contains('pointer-events-none')).toBe(false)
    expect(result.isLocked()).toBe(false)
  })

  it('should not let one instance unlock another instance lock', () => {
    const first = runWithScope(() => useLockScroll())
    const second = runWithScope(() => useLockScroll())

    first.result.lockScroll()
    second.result.unlockScroll()

    expect(first.result.isLocked()).toBe(true)
    expect(document.documentElement.classList.contains('pointer-events-none')).toBe(true)

    first.stop()
    second.stop()
  })

  it('should preserve root classes that existed before locking', () => {
    document.documentElement.classList.add('pointer-events-none', 'scrollbar-disabled')

    const { result, stop } = runWithScope(() => useLockScroll())
    result.lockScroll()
    stop()

    expect(document.documentElement.classList.contains('pointer-events-none')).toBe(true)
    expect(document.documentElement.classList.contains('scrollbar-disabled')).toBe(true)
  })

  it('should register a cancelable touchmove listener', () => {
    const addEventListener = vi.spyOn(document, 'addEventListener')
    const { result, stop } = runWithScope(() => useLockScroll())

    result.lockScroll()

    const touchMoveCall = addEventListener.mock.calls.find(([event]) => event === 'touchmove')
    expect(touchMoveCall?.[2]).toEqual({ passive: false })

    const event = new Event('touchmove', { cancelable: true })
    document.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(true)

    stop()
  })

  describe('with a target element', () => {
    function createScroller(overflow = 'auto') {
      const el = document.createElement('div')
      el.style.overflowX = overflow
      el.style.overflowY = overflow
      document.body.appendChild(el)

      return el
    }

    afterEach(() => {
      document.body.innerHTML = ''
    })

    it('should lock only the target and leave the root untouched', () => {
      const el = createScroller()
      const { result, stop } = runWithScope(() => useLockScroll(el))

      result.lockScroll()

      expect(el.style.overflowX).toBe('hidden')
      expect(el.style.overflowY).toBe('hidden')
      expect(el.style.getPropertyPriority('overflow-y')).toBe('important')
      expect(result.isLocked()).toBe(true)
      expect(document.documentElement.classList.contains('pointer-events-none')).toBe(false)

      result.unlockScroll()

      expect(el.style.overflowX).toBe('auto')
      expect(el.style.overflowY).toBe('auto')
      expect(result.isLocked()).toBe(false)
      stop()
    })

    it('should reserve the scrollbar gutter only when a scrollbar is showing', () => {
      vi.spyOn(dom, 'hasScrollbar').mockReturnValue({ x: false, y: true })

      const el = createScroller()
      const { result, stop } = runWithScope(() => useLockScroll(el))

      result.lockScroll()
      expect(el.style.getPropertyValue('scrollbar-gutter')).toBe('stable')

      result.unlockScroll()
      expect(el.style.getPropertyValue('scrollbar-gutter')).toBe('')
      stop()
    })

    it('should skip elements that do not scroll', () => {
      const el = createScroller('visible')
      const { result, stop } = runWithScope(() => useLockScroll(el))

      result.lockScroll()

      expect(el.style.overflowY).toBe('visible')
      expect(result.isLocked()).toBe(false)
      stop()
    })

    it('should resolve a getter target at lock time', () => {
      const el = createScroller()
      const { result, stop } = runWithScope(() => useLockScroll(() => el))

      result.lockScroll()

      expect(el.style.overflowY).toBe('hidden')
      stop()
    })

    it('should restore mixed per-axis overflow values', () => {
      const el = createScroller()
      el.style.overflowX = 'hidden'
      const { result, stop } = runWithScope(() => useLockScroll(el))

      result.lockScroll()
      result.unlockScroll()

      expect(el.style.overflowX).toBe('hidden')
      expect(el.style.overflowY).toBe('auto')
      stop()
    })

    it('should keep the lock until every instance releases it', () => {
      const el = createScroller()
      const first = runWithScope(() => useLockScroll(el))
      const second = runWithScope(() => useLockScroll(el))

      first.result.lockScroll()
      second.result.lockScroll()
      first.result.unlockScroll()

      expect(el.style.overflowY).toBe('hidden')

      second.result.unlockScroll()

      expect(el.style.overflowY).toBe('auto')
      first.stop()
      second.stop()
    })

    it('should release the lock when the scope is disposed', () => {
      const el = createScroller()
      const { result, stop } = runWithScope(() => useLockScroll(el))

      result.lockScroll()
      expect(el.style.overflowY).toBe('hidden')

      stop()

      expect(el.style.overflowY).toBe('auto')
    })
  })
})
