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
}

export const [provideTabsContext, useTabsContext] = createContext<TabsContext>('Tabs')
