import type { ListOptionSelected } from '../components/list/types'
import type { Ref } from 'vue'
import { createContext } from '../utils/context.js'

export interface ListContext {
  value: Ref<unknown>
  onItemSelect: (value: ListOptionSelected['value']) => void
}

export const [provideListContext, useListContext] = createContext<ListContext>('List')
