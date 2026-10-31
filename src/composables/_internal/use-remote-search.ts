import type { ComputedRef, MaybeRefOrGetter, ShallowRef } from 'vue'
import { computed, onScopeDispose, shallowRef, watch } from 'vue'
import { toValue } from '../../utils/helper.js'
import { debounce } from '../../utils/timing.js'

const REMOTE_SEARCH_DEBOUNCE = 200

export type RemoteSearchFn<T> = (query: string) => T[] | Promise<T[]>

export interface UseRemoteSearchOptions<T> {
  query: MaybeRefOrGetter<string>
  search?: MaybeRefOrGetter<RemoteSearchFn<T> | undefined>
}

export interface UseRemoteSearchReturn<T> {
  /** The answer the query last settled on, absent before the first one. */
  matches: ShallowRef<T[] | undefined>
  /** Whether a search function is set at all. */
  remote: ComputedRef<boolean>
  /** The trimmed query every answer is keyed to. */
  needle: ComputedRef<string>
  /** Whether a request is in flight, the debounce window included. */
  pending: ShallowRef<boolean>
}

export function useRemoteSearch<T>({
  query,
  search,
}: UseRemoteSearchOptions<T>): UseRemoteSearchReturn<T> {
  const matches = shallowRef<T[]>()
  const pending = shallowRef(false)
  const remote = computed(() => typeof toValue(search) === 'function')
  const needle = computed(() => (toValue(query) ?? '').trim())

  let requestId = 0

  function invalidate(): void {
    requestId += 1
    runSearch.cancel()
  }

  async function run(current: string): Promise<void> {
    const at = ++requestId
    const searchFn = toValue(search)

    if (!searchFn) {
      return
    }

    try {
      const result = await searchFn(current)

      if (at === requestId) {
        matches.value = Array.isArray(result) ? result : []
      }
    } catch {
      if (at === requestId) {
        matches.value = []
      }
    } finally {
      if (at === requestId) {
        pending.value = false
      }
    }
  }

  const runSearch = debounce((current: string) => {
    void run(current)
  }, REMOTE_SEARCH_DEBOUNCE)

  watch(
    [remote, needle],
    ([isRemote, current]) => {
      invalidate()

      // An answer from an earlier query must not outlive it.
      if (!isRemote || !current) {
        matches.value = undefined
        pending.value = false
        return
      }

      // Pending from the keystroke rather than from the request: the debounce window is part of it.
      pending.value = true
      runSearch(current)
    },
    { immediate: true },
  )

  onScopeDispose(invalidate)

  return { matches, remote, needle, pending }
}
