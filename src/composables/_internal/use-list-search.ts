import type {
  ListFilterMethodFn,
  ListOption,
  ListOptionEntry,
  ListOptions,
  ListRemoteFilterFn,
} from '../../components/list/types'
import type { ComputedRef, MaybeRefOrGetter, ShallowRef } from 'vue'
import { computed } from 'vue'
import { isFuzzyMatch } from '../../utils/fuzzy-match.js'
import { toValue } from '../../utils/helper.js'
import { useRemoteSearch } from './use-remote-search.js'
import { isListOptionGroup } from './use-selected-list-item.js'

// Options are stable prop objects, so their search text is derived once: rebuilding it per
// keystroke was roughly half the local filter cost on a 2000-option list.
const optionTextCache = new WeakMap<ListOption, string>()

function getOptionText(option: ListOption): string {
  const cached = optionTextCache.get(option)

  if (cached !== undefined) {
    return cached
  }

  const text = `${String(option.label ?? '')}${String(option.description ?? '')}`.trim()

  optionTextCache.set(option, text)

  return text
}

function defaultFilter(option: ListOption, query: string): boolean {
  return isFuzzyMatch(getOptionText(option), query)
}

/** Pure filter over list options. Groups with no matching children are dropped. */
export function filterListOptions(
  options: ListOptions,
  query: string,
  filter: ListFilterMethodFn | undefined = defaultFilter,
): ListOptions {
  const needle = query.trim()

  if (!needle) {
    return options
  }

  const result: ListOptions = []

  for (const entry of options) {
    if (isListOptionGroup(entry)) {
      const matched = entry.options.filter((item) => filter(item, needle))

      if (matched.length) {
        result.push({ ...entry, options: matched })
      }
    } else if (filter(entry, needle)) {
      result.push(entry)
    }
  }

  return result
}

export interface UseListSearchOptions {
  filterMethod?: MaybeRefOrGetter<ListFilterMethodFn | undefined>
  remoteFilter?: MaybeRefOrGetter<ListRemoteFilterFn | undefined>
}

export interface UseListSearchReturn {
  /** The remote answer while a query is active, the locally filtered options otherwise. */
  listOptions: ComputedRef<ListOptions>
  /** Whether a remote request is in flight, the debounce window included. */
  pending: ShallowRef<boolean>
}

export function useListSearch(
  options: MaybeRefOrGetter<ListOptions>,
  query: MaybeRefOrGetter<string>,
  { filterMethod, remoteFilter }: UseListSearchOptions = {},
): UseListSearchReturn {
  const { matches, needle, remote, pending } = useRemoteSearch<ListOptionEntry>({
    query,
    search: remoteFilter,
  })

  const localOptions = computed(() =>
    filterListOptions(toValue(options) ?? [], needle.value, toValue(filterMethod)),
  )
  const active = computed(() => remote.value && needle.value !== '')

  const listOptions = computed(() =>
    active.value ? (matches.value ?? []) : localOptions.value,
  )

  return { listOptions, pending }
}
