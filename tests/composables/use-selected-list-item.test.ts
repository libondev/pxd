import { describe, expect, it } from 'vite-plus/test'
import { ref } from 'vue'
import { useSelectedListItem, useSelectedListItems } from '../../src/composables/_internal/use-selected-list-item'

const options = [
  { label: 'One', value: 1 },
  {
    type: 'group' as const,
    label: 'Group',
    options: [{ label: 'Two', value: 2 }],
  },
  {
    label: 'Parent',
    value: 'parent',
    children: [{ label: 'Child', value: 'child' }],
  },
]

describe('useSelectedListItems', () => {
  it('should resolve values in model order including groups and children', () => {
    const selectedItems = useSelectedListItems(options, [2, 'child', 1])

    expect(selectedItems.value.map((item) => item.label)).toEqual(['Two', 'Child', 'One'])
  })
})

describe('useSelectedListItem', () => {
  it('should return the first resolved option', () => {
    const modelValue = ref(2)
    const selectedItem = useSelectedListItem(() => options, modelValue)

    expect(selectedItem.value?.label).toBe('Two')

    modelValue.value = 99
    expect(selectedItem.value).toBeNull()
  })
})
