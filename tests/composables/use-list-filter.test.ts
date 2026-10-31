import type { ListFilterMethodFn } from '../../src/components/list/types'
import { describe, expect, it } from 'vite-plus/test'
import { ref } from 'vue'
import { filterListOptions, useListFilter } from '../../src/composables/_internal/use-list-filter'

describe('useListFilter', () => {
  it('should return expected API', () => {
    const options = ref([
      { label: 'Hello', value: '1' },
      { label: 'World', value: '2' },
    ])
    const keyword = ref('')
    const result = useListFilter(options, keyword)

    expect(result.filteredOptions).toBeDefined()
    expect(result.visibleCount).toBeDefined()
    expect(result).not.toHaveProperty('searchValue')
  })

  it('should return all options when keyword is empty', () => {
    const options = [
      { label: 'Hello', value: '1' },
      { label: 'World', value: '2' },
    ]
    const keyword = ref('')
    const { filteredOptions, visibleCount } = useListFilter(options, keyword)

    expect(filteredOptions.value).toEqual(options)
    expect(visibleCount.value).toBe(2)
  })

  it('should filter items by keyword', () => {
    const options = [
      { label: 'Hello', value: '1' },
      { label: 'World', value: '2' },
    ]
    const keyword = ref('hello')
    const { filteredOptions, visibleCount } = useListFilter(options, keyword)

    expect(filteredOptions.value).toEqual([{ label: 'Hello', value: '1' }])
    expect(visibleCount.value).toBe(1)
  })

  it('should keep groups that have matching children', () => {
    const options = [
      {
        type: 'group' as const,
        label: 'Group',
        options: [
          { label: 'Hello', value: '1' },
          { label: 'World', value: '2' },
        ],
      },
    ]
    const keyword = ref('hello')
    const { filteredOptions, visibleCount } = useListFilter(options, keyword)

    expect(visibleCount.value).toBe(1)
    expect(filteredOptions.value).toEqual([
      {
        type: 'group',
        label: 'Group',
        options: [{ label: 'Hello', value: '1' }],
      },
    ])
  })

  it('filterListOptions should drop empty groups', () => {
    const result = filterListOptions(
      [
        {
          type: 'group',
          label: 'Group',
          options: [{ label: 'World', value: '2' }],
        },
      ],
      'hello',
    )

    expect(result).toEqual([])
  })

  it('should hand the whole option to a custom filter', () => {
    const options = [{ label: 'Preferences', value: '1', aliases: ['settings', 'config'] }]
    const filter: ListFilterMethodFn = (option, query) =>
      [...(option.aliases ?? []), String(option.label)].some((term) => term.includes(query))

    expect(filterListOptions(options, 'settings', filter)).toEqual(options)
    expect(filterListOptions(options, 'nothing', filter)).toEqual([])
  })

  it('should read a late filter on the next run', () => {
    const options = [
      { label: 'Hello', value: '1' },
      { label: 'World', value: '2' },
    ]
    const filter = ref<ListFilterMethodFn>()
    const keyword = ref('zzz')
    const { filteredOptions } = useListFilter(options, keyword, { filter: () => filter.value })

    expect(filteredOptions.value).toEqual([])

    filter.value = () => true
    expect(filteredOptions.value).toEqual(options)
  })
})
