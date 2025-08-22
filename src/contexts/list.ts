import type { Ref } from 'vue'
import type { ListOption } from '../types/components/list'
import { createContext } from '../utils/context'

export interface ListContext {
  activeIndex: Ref<number>
  increaseIndex: Ref<number>
  onOptionClick: ListOption['onClick']
  registerListItem: (index: number, el: HTMLElement, data: ListOption) => void
  unregisterListItem: (index: number) => void
}

export const [
  provideListContext,
  useListContext,
] = createContext<ListContext>('List')
