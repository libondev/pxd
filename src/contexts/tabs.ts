import type { TabsEmits, TabsProps } from '../components/tabs/types'
import type { ComponentLabel, ComponentValue } from '../types/shared'
import type { EmitFn, Slots } from 'vue'
import { createContext } from '../utils/context.js'

export interface TabsItemState {
  id: string
  value: ComponentValue
  label?: ComponentLabel
  disabled?: boolean
  slots: Slots
}

export interface TabsContext {
  props: TabsProps
  emits: EmitFn<TabsEmits>
  registerItem: (key: string, item: TabsItemState, el?: HTMLElement | null) => void
  unregisterItem: (key: string) => void
}

export const [provideTabsContext, useTabsContext] = createContext<TabsContext>('Tabs')
