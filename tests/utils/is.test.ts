import { afterEach, describe, expect, it, vi } from 'vite-plus/test'
import { isTouchDevice } from '../../src/utils/is'

describe('isTouchDevice', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should report false when matchMedia is unavailable', () => {
    vi.stubGlobal('matchMedia', undefined)

    expect(isTouchDevice()).toBe(false)
  })

  it('should read the coarse pointer query', () => {
    const matchMedia = vi.fn(() => ({ matches: true }))

    vi.stubGlobal('matchMedia', matchMedia)

    expect(isTouchDevice()).toBe(true)
    expect(matchMedia).toHaveBeenCalledWith('(hover: none) and (pointer: coarse)')
  })
})
