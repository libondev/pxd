import type { ListOption } from '../components/list/types'
import type { ComputedRef, Ref } from 'vue'
import { createContext } from '../utils/context'

export interface ListContext {
  activeIndex: Ref<number>
  registerItem: (el: HTMLElement, indexRef: Ref<number>) => void
  unregisterItem: (el: HTMLElement) => void
  onOptionClick: ListOption['onClick']
}

export const [provideListContext, useListContext] = createContext<ListContext>('List')

export interface ListFilterItemPayload {
  groupId: string | null
  getValue: () => string
  getKeywords: () => string[]
}

export interface ListFilterContext {
  searchValue: Ref<string>
  visibleCount: ComputedRef<number>
  isItemVisible: (id: string) => boolean
  isGroupVisible: (id: string) => boolean
  registerItem: (id: string, payload: ListFilterItemPayload) => void
  unregisterItem: (id: string) => void
}

export const [provideListFilterContext, useListFilterContext] = createContext<ListFilterContext>(
  'ListFilter',
  null,
)

/**
 * Provided by group containers so nested list items know which group to
 * register into.
 */
export const [provideListFilterGroupId, useListFilterGroupId] = createContext<string>(
  'ListFilterGroupId',
  null,
)
