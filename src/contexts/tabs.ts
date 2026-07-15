import type { TabsEmits, TabsProps, TabsValue } from '../components/tabs/types'
import type { ComponentLabel } from '../types/shared'
import type { EmitFn, Slots } from 'vue'
import { createContext } from '../utils/context'

export interface TabsItemState {
  id: string
  value: TabsValue
  label?: ComponentLabel
  disabled?: boolean
  slots: Slots
}

export interface TabsContext {
  props: TabsProps
  emits: EmitFn<TabsEmits>
  registerItem: (item: TabsItemState) => void
  unregisterItem: (id: string) => void
  updateItem: (item: TabsItemState) => void
}

export const [provideTabsContext, useTabsContext] = createContext<TabsContext>('Tabs')
