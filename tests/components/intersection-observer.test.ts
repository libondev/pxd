import { describe, expect, it } from 'vite-plus/test'

describe('intersection-observer', () => {
  it('should be a valid component', async () => {
    const mod = await import('../../src/components/intersection-observer/index.vue')
    expect(mod.default).toBeDefined()
  })
})
