import type { ListOption, ListOptions } from '../../components/list/types'
import type { MaybeRefOrGetter, ComputedRef } from 'vue'
import { computed } from 'vue'
import { isFuzzyMatch } from '../../utils/fuzzy-match.js'
import { toValue } from '../../utils/helper.js'
import { isListOptionGroup } from './use-selected-list-item.js'

export type ListFilterFn = (text: string, search: string, keywords: string[]) => boolean

export interface UseListFilterOptions {
  filter?: ListFilterFn
}

export interface UseListFilterReturn {
  filteredOptions: ComputedRef<ListOptions>
  visibleCount: ComputedRef<number>
}

function getOptionText(option: ListOption): string {
  return `${String(option.label ?? '')}${String(option.description ?? '')}`.trim()
}

export function countListOptions(options: ListOptions): number {
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
  filter: ListFilterFn = isFuzzyMatch,
): ListOptions {
  const needle = query.trim()

  if (!needle) {
    return options
  }

  const result: ListOptions = []

  for (const entry of options) {
    if (isListOptionGroup(entry)) {
      const matched = entry.options.filter((item) =>
        filter(getOptionText(item), needle, item.keywords ?? []),
      )

      if (matched.length) {
        result.push({ ...entry, options: matched })
      }
    } else if (filter(getOptionText(entry), needle, entry.keywords ?? [])) {
      result.push(entry)
    }
  }

  return result
}

export function useListFilter(
  options: MaybeRefOrGetter<ListOptions>,
  keyword: MaybeRefOrGetter<string>,
  { filter = isFuzzyMatch }: UseListFilterOptions = {},
): UseListFilterReturn {
  const filteredOptions = computed(() =>
    filterListOptions(toValue(options) ?? [], toValue(keyword) ?? '', filter),
  )

  const visibleCount = computed(() => countListOptions(filteredOptions.value))

  return {
    filteredOptions,
    visibleCount,
  }
}
