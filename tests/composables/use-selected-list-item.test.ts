import { describe, expect, it } from 'vite-plus/test'
import { ref } from 'vue'
import {
  useSelectedListItem,
  useSelectedListItems,
} from '../../src/composables/_internal/use-selected-list-item'

const options = [
  { label: 'One', value: 1 },
  {
    type: 'group' as const,
    label: 'Group',
    options: [{ label: 'Two', value: 2 }],
  },
]

describe('useSelectedListItems', () => {
  it('should resolve values in model order including groups', () => {
    const selectedItems = useSelectedListItems(options, [2, 1])

    expect(selectedItems.value.map((item) => item.label)).toEqual(['Two', 'One'])
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
