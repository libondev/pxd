import { describe, expect, it, vi, beforeEach, afterEach } from 'vite-plus/test'
import { useMediaQuery } from '../../src/composables/use-media-query'

describe('useMediaQuery', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return a ref', () => {
    const result = useMediaQuery('(min-width: 768px)')

    expect(result).toBeDefined()
    expect(typeof result.value).toBe('boolean')
  })

  it('should return boolean based on matchMedia', () => {
    const result = useMediaQuery('(min-width: 768px)')

    expect(typeof result.value).toBe('boolean')
  })

  it('should export PRESET_MEDIA_QUERIES', async () => {
    const { PRESET_MEDIA_QUERIES } = await import('../../src/composables/use-media-query')

    expect(PRESET_MEDIA_QUERIES).toBeDefined()
    expect(PRESET_MEDIA_QUERIES.IS_XS).toBeDefined()
    expect(PRESET_MEDIA_QUERIES.SM_UP).toBeDefined()
    expect(PRESET_MEDIA_QUERIES.MD_UP).toBeDefined()
  })
})
