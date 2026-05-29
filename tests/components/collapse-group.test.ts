import { describe, expect, it } from 'vite-plus/test'

describe('collapse-group', () => {
  it('should be a valid component', async () => {
    const mod = await import('../../src/components/collapse-group/index.vue')
    expect(mod.default).toBeDefined()
  })
})
