import { describe, expect, it } from 'vite-plus/test'

describe('choicebox-item', () => {
  it('should be a valid component', async () => {
    const mod = await import('../../src/components/choicebox-item/index.vue')
    expect(mod.default).toBeDefined()
  })
})
