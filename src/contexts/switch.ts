import type { SwitchEmits, SwitchProps } from '../components/switch/types'
import type { EmitFn } from 'vue'
import { createContext } from '../utils/context'

export interface SwitchContext {
  name: string
  props: SwitchProps
  emits: EmitFn<SwitchEmits>
}

export const [provideSwitchContext, useSwitchContext] = createContext<SwitchContext>('Switch')
