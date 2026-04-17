import type { ListOption } from '../components/list/types'
import type { Ref } from 'vue'
import { createContext } from '../utils/context'

export interface ListContext {
  activeIndex: Ref<number>
  registerItem: (el: HTMLElement, indexRef: Ref<number>) => void
  unregisterItem: (el: HTMLElement) => void
  onOptionClick: ListOption['onClick']
}

export const [provideListContext, useListContext] = createContext<ListContext>('List')

export const [provideListFilterValue, useListFilterValue] = createContext<Ref<string>>(
  'ListFilterValue',
  null,
)
