import type { ListOption } from '../components/list/types'
import type { Ref } from 'vue'
import { createContext } from '../utils/context'

export interface ListContext {
  activeValue: Ref<string>
  onOptionClick: ListOption['onClick']
}

export const [provideListContext, useListContext] = createContext<ListContext>('List')

export const [provideListFilterValue, useListFilterValue] = createContext<Ref<string>>(
  'ListFilterValue',
  null,
)
