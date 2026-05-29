import { describe, expect, it } from 'vite-plus/test'

describe('list-item', () => {
  it('should be a valid component', async () => {
    const mod = await import('../../src/components/list-item/index.vue')
    expect(mod.default).toBeDefined()
  })
})
