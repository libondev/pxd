import type { ListOption } from '../../src/components/list/types'
import { describe, expect, it, vi } from 'vite-plus/test'
import { ref } from 'vue'
import { useMentionSuggest } from '../../src/composables/_internal/use-mention-suggest'
import { useSetupWrapper } from '../helpers/setup'

const FILES = [{ label: 'App.vue', value: 'src/App.vue' }]
const COMMANDS = [{ label: 'review', value: 'review' }]

function setup(options: {
  filterMethod?: (query: string, trigger: string) => unknown
  resolve?: (trigger: string) => ListOption[]
}) {
  const visible = ref(false)
  const requested: string[] = []

  const api = useSetupWrapper(() =>
    useMentionSuggest({
      getOptions: (trigger) => {
        requested.push(trigger)
        return options.resolve ? options.resolve(trigger) : trigger === '/' ? COMMANDS : FILES
      },
      getFilterMethod: () => options.filterMethod as never,
      isDisabled: () => false,
      visible,
      setVisible: (next) => {
        visible.value = next
      },
    }),
  )

  return { api, requested, visible }
}

describe('useMentionSuggest', () => {
  it('asks for options through the trigger that opened the popover', () => {
    const { api, requested } = setup({})

    api.open('@')
    expect(api.listOptions.value).toBe(FILES)

    api.close()
    api.open('/')
    expect(api.listOptions.value).toBe(COMMANDS)
    expect(requested).toEqual(['@', '/'])

    api.unmount()
  })

  it('keeps the opening trigger when a new query arrives', () => {
    const { api, requested } = setup({})

    api.open('/')
    api.setKeyword('rev')

    expect(api.filterKeyword.value).toBe('rev')
    expect(api.listOptions.value).toEqual([{ label: 'review', value: 'review' }])
    expect(requested).toEqual(['/', '/'])

    api.unmount()
  })

  it('passes the opening trigger to an async filter', async () => {
    vi.useFakeTimers()

    const filterMethod = vi.fn((query: string) => [{ label: query, value: query }])
    const { api } = setup({ filterMethod })

    api.open('/')
    api.setKeyword('rev')
    await vi.advanceTimersByTimeAsync(200)

    expect(filterMethod).toHaveBeenCalledWith('rev', '/')

    api.unmount()
    vi.useRealTimers()
  })

  it('calls an empty result only for a query that was actually typed', () => {
    const { api } = setup({ resolve: () => [] })

    api.open('@')
    expect(api.listOptions.value).toEqual([])
    expect(api.isEmptyResult.value).toBe(false)

    api.setKeyword('zz')
    expect(api.isEmptyResult.value).toBe(true)

    api.unmount()
  })

  it('does not call an empty result while an async search is in flight', async () => {
    vi.useFakeTimers()

    let resolveFilter!: (options: ListOption[]) => void

    const { api } = setup({
      filterMethod: () =>
        new Promise<ListOption[]>((resolve) => {
          resolveFilter = resolve
        }),
    })

    api.open('@')
    api.setKeyword('zz')

    // Still inside the debounce window: nothing has been asked yet, so the stale
    // options must not be reported as this query's (empty) result.
    expect(api.isPending.value).toBe(true)
    expect(api.isEmptyResult.value).toBe(false)

    await vi.advanceTimersByTimeAsync(200)
    expect(api.isPending.value).toBe(true)
    expect(api.isEmptyResult.value).toBe(false)

    resolveFilter!(FILES)
    await vi.advanceTimersByTimeAsync(0)
    expect(api.listOptions.value).toBe(FILES)
    expect(api.isPending.value).toBe(false)

    api.unmount()
    vi.useRealTimers()
  })
})
