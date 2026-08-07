import type { ListFilterContext, ListFilterItemPayload } from '../contexts/list'
import type { ComputedRef, Ref } from 'vue'
import { computed, shallowRef } from 'vue'
import { isFuzzyMatch } from '../utils/fuzzy-match'

export type ListFilterFn = (text: string, search: string, keywords: string[]) => boolean

export interface UseListFilterOptions {
  keyword: Ref<string>
  filter?: ListFilterFn
}

export interface UseListFilterReturn extends ListFilterContext {
  visibleCount: ComputedRef<number>
}

export function useListFilter({
  filter = isFuzzyMatch,
  keyword,
}: UseListFilterOptions): UseListFilterReturn {
  const items = new Map<string, ListFilterItemPayload>()

  const revision = shallowRef(0)

  const filterState = computed(() => {
    void revision.value
    let visibleCount = 0

    const search = keyword.value
    const visibleItems = new Set<string>()
    const visibleGroupIds = new Set<string>()

    function markItemVisible(id: string): void {
      if (visibleItems.has(id)) {
        return
      }

      visibleItems.add(id)

      const item = items.get(id)
      if (!item) {
        return
      }

      if (item.groupId) {
        visibleGroupIds.add(item.groupId)
      }

      if (item.parentItemId) {
        markItemVisible(item.parentItemId)
      }
    }

    for (const [id, item] of items) {
      if (filter(item.getValue(), search, item.getKeywords())) {
        markItemVisible(id)
        visibleCount++
      }
    }

    return {
      visibleItems,
      visibleGroupIds,
      visibleCount,
    }
  })

  const visibleCount = computed(() => filterState.value.visibleCount)

  function registerItem(id: string, payload: ListFilterItemPayload) {
    items.set(id, payload)
    revision.value++
  }

  function unregisterItem(id: string): void {
    if (!items.has(id)) {
      return
    }

    items.delete(id)
    revision.value++
  }

  function isItemVisible(id: string): boolean {
    return filterState.value.visibleItems.has(id)
  }

  function isGroupVisible(id: string): boolean {
    return filterState.value.visibleGroupIds.has(id)
  }

  return {
    searchValue: keyword,
    visibleCount,
    registerItem,
    isItemVisible,
    isGroupVisible,
    unregisterItem,
  }
}
