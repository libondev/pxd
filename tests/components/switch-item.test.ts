import { describe, expect, it } from 'vite-plus/test'

describe('switch-item', () => {
  it('should be a valid component', async () => {
    const mod = await import('../../src/components/switch-item/index.vue')
    expect(mod.default).toBeDefined()
  })
})
