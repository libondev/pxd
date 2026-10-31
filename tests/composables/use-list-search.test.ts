import type { ListOptions } from '../../src/components/list/types'
import { afterEach, describe, expect, it, vi } from 'vite-plus/test'
import { ref } from 'vue'
import { useListSearch } from '../../src/composables/_internal/use-list-search'
import { useSetupWrapper } from '../helpers/setup'

afterEach(() => {
  vi.useRealTimers()
})

describe('useListSearch', () => {
  it('should stay inert without a remote filter', () => {
    const query = ref('src')
    const api = useSetupWrapper(() => useListSearch({ query }))

    expect(api.remote.value).toBe(false)
    expect(api.active.value).toBe(false)
    expect(api.pending.value).toBe(false)
    expect(api.matches.value).toBeUndefined()

    api.unmount()
  })

  it('should ask 200ms after the last keystroke', async () => {
    vi.useFakeTimers()

    const query = ref('')
    const remoteFilter = vi.fn(async (value: string) => [{ label: value, value }])
    const api = useSetupWrapper(() =>
      useListSearch({ query, remoteFilter: () => remoteFilter }),
    )

    query.value = 'sr'
    await vi.advanceTimersByTimeAsync(0)

    // Pending from the keystroke: the debounce window counts as in flight.
    expect(api.pending.value).toBe(true)
    expect(remoteFilter).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(200)

    expect(remoteFilter).toHaveBeenCalledWith('sr')
    expect(api.matches.value).toEqual([{ label: 'sr', value: 'sr' }])
    expect(api.pending.value).toBe(false)

    api.unmount()
  })

  it('should ignore an answer the next query retired', async () => {
    vi.useFakeTimers()

    const query = ref('')
    const resolvers: Array<(options: ListOptions) => void> = []
    const remoteFilter = vi.fn(
      () =>
        new Promise<ListOptions>((resolve) => {
          resolvers.push(resolve)
        }),
    )
    const api = useSetupWrapper(() =>
      useListSearch({ query, remoteFilter: () => remoteFilter }),
    )

    query.value = 's'
    await vi.advanceTimersByTimeAsync(200)
    query.value = 'sr'
    await vi.advanceTimersByTimeAsync(200)
    expect(remoteFilter).toHaveBeenCalledTimes(2)

    resolvers[1]?.([{ label: 'sr', value: 'sr' }])
    await vi.advanceTimersByTimeAsync(0)
    expect(api.matches.value).toEqual([{ label: 'sr', value: 'sr' }])

    resolvers[0]?.([{ label: 's', value: 's' }])
    await vi.advanceTimersByTimeAsync(0)
    expect(api.matches.value).toEqual([{ label: 'sr', value: 'sr' }])
    expect(api.pending.value).toBe(false)

    api.unmount()
  })

  it('should drop the answers and settle once the query is cleared', async () => {
    vi.useFakeTimers()

    const query = ref('')
    const remoteFilter = vi.fn(async (value: string) => [{ label: value, value }])
    const api = useSetupWrapper(() =>
      useListSearch({ query, remoteFilter: () => remoteFilter }),
    )

    query.value = 'sr'
    await vi.advanceTimersByTimeAsync(200)
    expect(api.matches.value).toHaveLength(1)

    query.value = ''
    await vi.advanceTimersByTimeAsync(0)

    expect(api.active.value).toBe(false)
    expect(api.matches.value).toBeUndefined()
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
      useListSearch({ query, remoteFilter: () => remoteFilter }),
    )

    query.value = 'sr'
    await vi.advanceTimersByTimeAsync(200)

    expect(api.matches.value).toEqual([])
    expect(api.pending.value).toBe(false)

    api.unmount()
  })
})
