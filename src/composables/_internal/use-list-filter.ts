import type { ListFilterMethodFn, ListOption, ListOptions } from '../../components/list/types'
import type { MaybeRefOrGetter, ComputedRef } from 'vue'
import { computed } from 'vue'
import { isFuzzyMatch } from '../../utils/fuzzy-match.js'
import { toValue } from '../../utils/helper.js'
import { isListOptionGroup } from './use-selected-list-item.js'

export interface UseListFilterOptions {
  filter?: MaybeRefOrGetter<ListFilterMethodFn | undefined>
}

export interface UseListFilterReturn {
  filteredOptions: ComputedRef<ListOptions>
  visibleCount: ComputedRef<number>
}

function getOptionText(option: ListOption): string {
  return `${String(option.label ?? '')}${String(option.description ?? '')}`.trim()
}

function defaultFilter(option: ListOption, query: string): boolean {
  return isFuzzyMatch(getOptionText(option), query)
}

function countListOptions(options: ListOptions): number {
  let count = 0

  for (const entry of options) {
    if (isListOptionGroup(entry)) {
      count += entry.options.length
    } else {
      count += 1
    }
  }

  return count
}

/**
 * Pure filter over list options. Groups with no matching children are dropped.
 */
export function filterListOptions(
  options: ListOptions,
  query: string,
  filter: ListFilterMethodFn = defaultFilter,
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

export function useListFilter(
  options: MaybeRefOrGetter<ListOptions>,
  keyword: MaybeRefOrGetter<string>,
  { filter }: UseListFilterOptions = {},
): UseListFilterReturn {
  const filteredOptions = computed(() =>
    filterListOptions(
      toValue(options) ?? [],
      toValue(keyword) ?? '',
      toValue(filter) ?? defaultFilter,
    ),
  )

  const visibleCount = computed(() => countListOptions(filteredOptions.value))

  return {
    filteredOptions,
    visibleCount,
  }
}
