import { describe, expect, it } from 'vite-plus/test'

describe('resizable-handle', () => {
  it('should be a valid component', async () => {
    const mod = await import('../../src/components/resizable-handle/index.vue')
    expect(mod.default).toBeDefined()
  })
})
