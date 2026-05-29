import { describe, expect, it } from 'vite-plus/test'

describe('resizable-panel', () => {
  it('should be a valid component', async () => {
    const mod = await import('../../src/components/resizable-panel/index.vue')
    expect(mod.default).toBeDefined()
  })
})
