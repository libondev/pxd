import type { Ref } from 'vue'
import type { ListOption } from '../types/components/list'
import { createContext } from '../utils/context'

export interface ListContext {
  activeValue: Ref<string>
  onOptionClick: ListOption['onClick']
}

export const [
  provideListContext,
  useListContext,
] = createContext<ListContext>('List')
