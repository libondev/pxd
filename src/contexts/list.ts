import type { Ref } from 'vue'
import type { ListOption } from '../types/components/list'
import { createContext } from '../utils/context'

export interface ListContext {
  activeIndex: Ref<number>
  onOptionClick: ListOption['onClick']
  registerListItem: (el: HTMLElement) => void
  unregisterListItem: (el: HTMLElement) => void
}

export const [
  provideListContext,
  useListContext,
] = createContext<ListContext>('List')

export const [
  provideListItemIndexContext,
  useListItemIndexContext,
] = createContext<Ref<number>>('ListIndex')
