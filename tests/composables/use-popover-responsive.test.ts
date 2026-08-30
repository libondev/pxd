import { describe, expect, it, vi, beforeEach, afterEach } from 'vite-plus/test'
import { usePopoverResponsive } from '../../src/composables/_internal/use-popover-responsive'
import { useSetupWrapper } from '../helpers/setup'

describe('usePopoverResponsive', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return isAdaptive and responsiveClasses', () => {
    const { isAdaptive, responsiveClasses, unmount } = useSetupWrapper(() => usePopoverResponsive())

    expect(isAdaptive).toBeDefined()
    expect(typeof isAdaptive.value).toBe('boolean')
    expect(responsiveClasses).toBeDefined()
    expect(responsiveClasses.value).toBeDefined()
    expect(responsiveClasses.value.content).toBeDefined()
    expect(responsiveClasses.value.wrapper).toBeDefined()
    unmount()
  })

  it('should return string classes', () => {
    const { responsiveClasses, unmount } = useSetupWrapper(() => usePopoverResponsive())

    expect(typeof responsiveClasses.value.content).toBe('string')
    expect(typeof responsiveClasses.value.wrapper).toBe('string')
    unmount()
  })
})
