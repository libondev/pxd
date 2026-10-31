import type { ListFilterMethodFn, ListRemoteFilterFn } from '../../src/components/list/types'
import { afterEach, describe, expect, it, vi } from 'vite-plus/test'
import { ref } from 'vue'
import {
  filterListOptions,
  useListSearch,
} from '../../src/composables/_internal/use-list-search'
import { useSetupWrapper } from '../helpers/setup'

const options = [
  { label: 'Hello', value: '1' },
  { label: 'World', value: '2' },
]

afterEach(() => {
  vi.useRealTimers()
})

describe('filterListOptions', () => {
  it('should hand back the very same options for an empty query', () => {
    expect(filterListOptions(options, '')).toBe(options)
  })

  it('should filter items by query', () => {
    expect(filterListOptions(options, 'hello')).toEqual([{ label: 'Hello', value: '1' }])
  })

  it('should keep groups that have matching children', () => {
    const result = filterListOptions([{ type: 'group', label: 'Group', options }], 'hello')

    expect(result).toEqual([
      {
        type: 'group',
        label: 'Group',
        options: [{ label: 'Hello', value: '1' }],
      },
    ])
  })

  it('should drop groups without matching children', () => {
    const result = filterListOptions(
      [{ type: 'group', label: 'Group', options: [{ label: 'World', value: '2' }] }],
      'hello',
    )

    expect(result).toEqual([])
  })

  it('should hand the whole option to a custom filter', () => {
    const withAliases = [{ label: 'Preferences', value: '1', aliases: ['settings', 'config'] }]
    const filter: ListFilterMethodFn = (option, query) =>
      [...(option.aliases ?? []), String(option.label)].some((term) => term.includes(query))

    expect(filterListOptions(withAliases, 'settings', filter)).toEqual(withAliases)
    expect(filterListOptions(withAliases, 'nothing', filter)).toEqual([])
  })
})

describe('useListSearch', () => {
  it('should filter locally without a remote filter', () => {
    const query = ref('hello')
    const api = useSetupWrapper(() => useListSearch(options, query))

    expect(api.listOptions.value).toEqual([{ label: 'Hello', value: '1' }])
    expect(api.pending.value).toBe(false)

    api.unmount()
  })

  it('should hand the whole option to the filter method', () => {
    const query = ref('zzz')
    const filterMethod = ref<ListFilterMethodFn>()
    const api = useSetupWrapper(() =>
      useListSearch(options, query, { filterMethod: () => filterMethod.value }),
    )

    expect(api.listOptions.value).toEqual([])

    filterMethod.value = () => true
    expect(api.listOptions.value).toEqual(options)

    api.unmount()
  })

  it('should ask the remote filter 200ms after the last keystroke', async () => {
    vi.useFakeTimers()

    const query = ref('')
    const remoteFilter = vi.fn(async (value: string) => [{ label: value, value }])
    const api = useSetupWrapper(() =>
      useListSearch(options, query, { remoteFilter: () => remoteFilter }),
    )

    query.value = 'sr'
    await vi.advanceTimersByTimeAsync(0)

    // Pending from the keystroke: the debounce window counts as in flight.
    expect(api.pending.value).toBe(true)
    expect(remoteFilter).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(200)

    expect(remoteFilter).toHaveBeenCalledWith('sr')
    expect(api.listOptions.value).toEqual([{ label: 'sr', value: 'sr' }])
    expect(api.pending.value).toBe(false)

    api.unmount()
  })

  it('should prefer the remote answer over a local match', async () => {
    vi.useFakeTimers()

    const query = ref('hello')
    const remoteFilter: ListRemoteFilterFn = async () => [{ label: 'Remote', value: 'r' }]
    const api = useSetupWrapper(() =>
      useListSearch(options, query, { remoteFilter: () => remoteFilter }),
    )

    await vi.advanceTimersByTimeAsync(200)

    expect(api.listOptions.value).toEqual([{ label: 'Remote', value: 'r' }])

    api.unmount()
  })

  it('should ignore an answer the next query retired', async () => {
    vi.useFakeTimers()

    const query = ref('')
    const resolvers: Array<(list: { label: string; value: string }[]) => void> = []
    const remoteFilter = vi.fn(
      () =>
        new Promise<{ label: string; value: string }[]>((resolve) => {
          resolvers.push(resolve)
        }),
    )
    const api = useSetupWrapper(() =>
      useListSearch(options, query, { remoteFilter: () => remoteFilter }),
    )

    query.value = 's'
    await vi.advanceTimersByTimeAsync(200)
    query.value = 'sr'
    await vi.advanceTimersByTimeAsync(200)
    expect(remoteFilter).toHaveBeenCalledTimes(2)

    resolvers[1]?.([{ label: 'sr', value: 'sr' }])
    await vi.advanceTimersByTimeAsync(0)
    expect(api.listOptions.value).toEqual([{ label: 'sr', value: 'sr' }])

    resolvers[0]?.([{ label: 's', value: 's' }])
    await vi.advanceTimersByTimeAsync(0)
    expect(api.listOptions.value).toEqual([{ label: 'sr', value: 'sr' }])
    expect(api.pending.value).toBe(false)

    api.unmount()
  })

  it('should fall back to the local options once the query is cleared', async () => {
    vi.useFakeTimers()

    const query = ref('')
    const remoteFilter = vi.fn(async (value: string) => [{ label: value, value }])
    const api = useSetupWrapper(() =>
      useListSearch(options, query, { remoteFilter: () => remoteFilter }),
    )

    query.value = 'sr'
    await vi.advanceTimersByTimeAsync(200)
    expect(api.listOptions.value).toHaveLength(1)

    query.value = ''
    await vi.advanceTimersByTimeAsync(0)

    expect(api.listOptions.value).toBe(options)
    expect(api.pending.value).toBe(false)

    api.unmount()
  })

  it('should settle to an empty result when the search rejects', async () => {
    vi.useFakeTimers()

    const query = ref('')
    const remoteFilter = vi.fn(async () => {
      throw new Error('boom')
    })
    const api = useSetupWrapper(() =>
      useListSearch(options, query, { remoteFilter: () => remoteFilter }),
    )

    query.value = 'sr'
    await vi.advanceTimersByTimeAsync(200)

    expect(api.listOptions.value).toEqual([])
    expect(api.pending.value).toBe(false)

    api.unmount()
  })
})
