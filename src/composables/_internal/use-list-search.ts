import type { ListOptions, ListRemoteFilterFn } from '../../components/list/types'
import type { ComputedRef, MaybeRefOrGetter, ShallowRef } from 'vue'
import { computed, onScopeDispose, shallowRef, watch } from 'vue'
import { toValue } from '../../utils/helper.js'
import { debounce } from '../../utils/timing.js'

const REMOTE_SEARCH_DEBOUNCE = 200

export interface UseListSearchOptions {
  query: MaybeRefOrGetter<string>
  remoteFilter?: MaybeRefOrGetter<ListRemoteFilterFn | undefined>
}

export interface UseListSearchReturn {
  /** The options the query last settled on, absent before the first answer. */
  matches: ShallowRef<ListOptions | undefined>
  remote: ComputedRef<boolean>
  /** Whether a request is in flight, the debounce window included. */
  pending: ShallowRef<boolean>
  /** Whether a non-empty query searches remotely, so `matches` replaces the local result. */
  active: ComputedRef<boolean>
}

export function useListSearch({ query, remoteFilter }: UseListSearchOptions): UseListSearchReturn {
  const matches = shallowRef<ListOptions>()
  const pending = shallowRef(false)
  const remote = computed(() => typeof toValue(remoteFilter) === 'function')
  const needle = computed(() => (toValue(query) ?? '').trim())
  const active = computed(() => remote.value && needle.value !== '')

  let requestId = 0

  function invalidate(): void {
    requestId += 1
    runSearch.cancel()
  }

  async function run(query: string): Promise<void> {
    const at = ++requestId
    const search = toValue(remoteFilter)

    if (!search) {
      return
    }

    try {
      const result = await search(query)

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

  const runSearch = debounce((query: string) => {
    void run(query)
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

  return { matches, remote, pending, active }
}
