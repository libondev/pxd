import { describe, expect, it } from 'vite-plus/test'
import { useClientOnline } from '../../src/composables/use-client-online'

describe('useClientOnline', () => {
  it('should export useClientOnline as a function', () => {
    expect(typeof useClientOnline).toBe('function')
  })
})
