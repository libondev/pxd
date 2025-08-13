import type { Ref } from 'vue'
import { createContext } from '../utils/context'

export interface ListContext {
  activeIndex: Ref<number>
  onOptionClick: (ev: MouseEvent, index: number) => void
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
