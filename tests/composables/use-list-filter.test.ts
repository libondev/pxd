import { describe, expect, it } from 'vite-plus/test'
import { ref } from 'vue'
import { useListFilter } from '../../src/composables/use-list-filter'

describe('useListFilter', () => {
  it('should return expected API', () => {
    const keyword = ref('')
    const result = useListFilter({ keyword })

    expect(result.searchValue).toBeDefined()
    expect(result.visibleCount).toBeDefined()
    expect(typeof result.registerItem).toBe('function')
    expect(typeof result.unregisterItem).toBe('function')
    expect(typeof result.isItemVisible).toBe('function')
    expect(typeof result.isGroupVisible).toBe('function')
  })

  it('should make items visible after register', () => {
    const keyword = ref('')
    const { registerItem, isItemVisible } = useListFilter({ keyword })

    registerItem('item-1', {
      groupId: null,
      getValue: () => 'hello',
      getKeywords: () => [],
    })
    expect(isItemVisible('item-1')).toBe(true)
  })

  it('should track visibleCount', () => {
    const keyword = ref('')
    const { registerItem, visibleCount } = useListFilter({ keyword })

    registerItem('item-1', {
      groupId: 'g1',
      getValue: () => 'hello',
      getKeywords: () => [],
    })
    registerItem('item-2', {
      groupId: 'g1',
      getValue: () => 'world',
      getKeywords: () => [],
    })

    expect(visibleCount.value).toBe(2)
  })
})
