import type { ListOptionSelected } from '../components/list/types'
import type { ListProps } from '../components/list/types'
import type { ListNavigationCommand } from '../composables/use-list-navigation.js'
import type { ComputedRef, Ref, ShallowRef } from 'vue'
import { createContext } from '../utils/context.js'

export interface ListContext {
  props: ListProps
  activeIndex: Ref<number>
  setActiveIndex: (index: number) => void
  registerItem: (el: HTMLElement, indexRef: Ref<number>) => void
  unregisterItem: (el: HTMLElement) => void
  onItemSelect: (value: ListOptionSelected['value'], ev: MouseEvent) => void
  onRootSelect: (value: ListOptionSelected['value'], ev: MouseEvent) => void
  onToggle: () => void
  activeList: ShallowRef<ListContext | null>
  activate: () => void
  activateFirst: () => void
  dispatch: (command: ListNavigationCommand) => boolean
  registerChildList: (item: HTMLElement, childList: ListContext) => void
  unregisterChildList: (item: HTMLElement) => void
  getChildList: (item: HTMLElement) => ListContext | undefined
}

export const [provideListContext, useListContext] = createContext<ListContext>('List')

export interface ListNestedContext {
  list: ListContext
  parentItem?: ShallowRef<HTMLElement | undefined>
  hidden: Readonly<Ref<boolean>>
}

export const [provideListNestedContext, useListNestedContext] = createContext<ListNestedContext>(
  'ListNested',
  null,
)

export interface ListFilterItemPayload {
  groupId: string | null
  parentItemId?: string | null
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

export const [provideListFilterParentItemId, useListFilterParentItemId] = createContext<string>(
  'ListFilterParentItemId',
  null,
)
