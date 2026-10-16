import { afterEach, describe, expect, it, vi } from 'vite-plus/test'
import { useLockScroll } from '../../src/composables/_internal/use-lock-scroll'
import * as dom from '../../src/utils/dom'
import { runWithScope } from '../helpers/setup'

const rootStyleProperties = ['overflow-x', 'overflow-y', 'scrollbar-gutter']

// happy-dom resolves no default overflow, so the document never looks scrollable on its own.
function mockDocumentScrollable() {
  vi.spyOn(dom, 'isScrollable').mockImplementation((el) => ({
    x: false,
    y: el === document.documentElement,
  }))
}

describe('useLockScroll', () => {
  afterEach(() => {
    for (const property of rootStyleProperties) {
      document.documentElement.style.removeProperty(property)
    }

    vi.restoreAllMocks()
  })

  it('should return expected API', () => {
    const { result, stop } = runWithScope(() => useLockScroll(() => document.body))
    const { isLocked, lockScroll, unlockScroll } = result

    expect(typeof isLocked).toBe('function')
    expect(typeof lockScroll).toBe('function')
    expect(typeof unlockScroll).toBe('function')
    stop()
  })

  it('should not be locked by default', () => {
    const { result, stop } = runWithScope(() => useLockScroll(() => document.body))
    const { isLocked } = result

    expect(isLocked()).toBe(false)
    stop()
  })

  it('should be locked after lockScroll', () => {
    mockDocumentScrollable()
    const { result, stop } = runWithScope(() =>
      useLockScroll(() => document.body, { walkAncestors: true }),
    )
    const { isLocked, lockScroll } = result

    lockScroll()
    expect(isLocked()).toBe(true)
    stop()
  })

  it('should fall back to the page when the anchor has no scroll container of its own', () => {
    mockDocumentScrollable()
    const el = document.createElement('div')
    document.body.appendChild(el)

    const { result, stop } = runWithScope(() => useLockScroll(el, { walkAncestors: true }))

    result.lockScroll()

    expect(document.documentElement.style.overflowY).toBe('hidden')

    result.unlockScroll()

    expect(document.documentElement.style.overflowY).toBe('')
    el.remove()
    stop()
  })

  it('should lock nothing when the anchor does not scroll and ancestors are excluded', () => {
    const el = document.createElement('div')
    document.body.appendChild(el)

    const { result, stop } = runWithScope(() => useLockScroll(el))

    result.lockScroll()

    expect(result.isLocked()).toBe(false)
    expect(document.documentElement.style.overflowY).toBe('')
    el.remove()
    stop()
  })

  it('should release all locks owned by a scope when it is disposed', () => {
    mockDocumentScrollable()
    const { result, stop } = runWithScope(() =>
      useLockScroll(() => document.body, { walkAncestors: true }),
    )

    result.lockScroll()
    result.lockScroll()
    stop()

    expect(document.documentElement.style.overflowY).toBe('')
    expect(result.isLocked()).toBe(false)
  })

  it('should not let one instance unlock another instance lock', () => {
    mockDocumentScrollable()
    const first = runWithScope(() => useLockScroll(() => document.body, { walkAncestors: true }))
    const second = runWithScope(() => useLockScroll(() => document.body, { walkAncestors: true }))

    first.result.lockScroll()
    second.result.unlockScroll()

    expect(first.result.isLocked()).toBe(true)
    expect(document.documentElement.style.overflowY).toBe('hidden')

    first.stop()
    second.stop()
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

    it('should lock only the scroll container the target sits in', () => {
      const el = createScroller()
      const { result, stop } = runWithScope(() => useLockScroll(el))

      result.lockScroll()

      expect(el.style.overflowX).toBe('hidden')
      expect(el.style.overflowY).toBe('hidden')
      expect(el.style.getPropertyPriority('overflow-y')).toBe('important')
      expect(document.documentElement.style.overflowY).toBe('')
      expect(result.isLocked()).toBe(true)

      result.unlockScroll()

      expect(el.style.overflowX).toBe('auto')
      expect(el.style.overflowY).toBe('auto')
      expect(result.isLocked()).toBe(false)
      stop()
    })

    it('should reserve the scrollbar gutter only when a vertical scrollbar is showing', () => {
      vi.spyOn(dom, 'hasScrollbar').mockReturnValue({ x: false, y: true })

      const el = createScroller()
      const { result, stop } = runWithScope(() => useLockScroll(el))

      result.lockScroll()
      expect(el.style.getPropertyValue('scrollbar-gutter')).toBe('stable')

      result.unlockScroll()
      expect(el.style.getPropertyValue('scrollbar-gutter')).toBe('')
      stop()
    })

    it('should not reserve the scrollbar gutter for a horizontal scrollbar', () => {
      vi.spyOn(dom, 'hasScrollbar').mockReturnValue({ x: true, y: false })

      const el = createScroller()
      const { result, stop } = runWithScope(() => useLockScroll(el))

      result.lockScroll()
      expect(el.style.getPropertyValue('scrollbar-gutter')).toBe('')
      stop()
    })

    it('should keep a style written from outside while locked', () => {
      const el = createScroller()
      const { result, stop } = runWithScope(() => useLockScroll(el))

      result.lockScroll()
      el.style.setProperty('overflow-y', 'scroll', 'important')

      result.unlockScroll()

      expect(el.style.overflowY).toBe('scroll')
      stop()
    })

    it('should walk up to the scroll container above the target when ancestors are included', () => {
      const container = createScroller()
      const el = document.createElement('div')
      container.appendChild(el)

      const { result, stop } = runWithScope(() => useLockScroll(el, { walkAncestors: true }))

      result.lockScroll()

      expect(el.style.overflowY).toBe('')
      expect(container.style.overflowY).toBe('hidden')
      expect(result.isLocked()).toBe(true)
      stop()
    })

    it('should not walk past a non-scrolling target', () => {
      const container = createScroller()
      const el = document.createElement('div')
      container.appendChild(el)

      const { result, stop } = runWithScope(() => useLockScroll(el))

      result.lockScroll()

      expect(container.style.overflowY).toBe('auto')
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
