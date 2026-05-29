import { describe, expect, it } from 'vite-plus/test'

describe('carousel-item', () => {
  it('should be a valid component', async () => {
    const mod = await import('../../src/components/carousel-item/index.vue')
    expect(mod.default).toBeDefined()
  })
})
