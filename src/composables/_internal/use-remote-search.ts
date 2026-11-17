import type { ComputedRef, ShallowRef, MaybeRefOrGetter } from 'vue'
import { computed, onScopeDispose, shallowRef, watch, toValue } from 'vue'
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
  /** The last rejected request's error, cleared once a new query starts or one settles. */
  error: ShallowRef<unknown>
  /** Re-run the current query, or a no-op when there is no remote request to repeat. */
  retry: () => void
}

export function useRemoteSearch<T>({
  query,
  search,
}: UseRemoteSearchOptions<T>): UseRemoteSearchReturn<T> {
  const matches = shallowRef<T[]>()
  const pending = shallowRef(false)
  const error = shallowRef<unknown>()
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
        error.value = undefined
      }
    } catch (cause) {
      if (at === requestId) {
        matches.value = []
        error.value = cause
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

  function retry(): void {
    const current = needle.value

    if (!remote.value || !current) {
      return
    }

    invalidate()
    error.value = undefined
    pending.value = true
    void run(current)
  }

  watch(
    [remote, needle],
    ([isRemote, current]) => {
      invalidate()
      error.value = undefined

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

  return { matches, remote, needle, pending, error, retry }
}
