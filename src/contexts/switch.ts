import type { EmitFn } from 'vue'

import type { SwitchGroupEmits, SwitchGroupProps } from '../components/switch-group/types'

import { createContext } from '../utils/context'

export interface SwitchGroupContext {
  name: string
  props: SwitchGroupProps
  emits: EmitFn<SwitchGroupEmits>
}

export const [provideSwitchGroupContext, useSwitchGroupContext] =
  createContext<SwitchGroupContext>('SwitchGroup')
