import type { EmitFn } from 'vue'

import type {
  ToggleButtonGroupProps,
  ToggleButtonGroupEmits,
} from '../components/toggle-button-group/types'
import { createContext } from '../utils/context'

export interface ToggleButtonGroupContext {
  props: ToggleButtonGroupProps
  emits: EmitFn<ToggleButtonGroupEmits>
}

export const [provideToggleButtonGroupContext, useToggleButtonGroupContext] =
  createContext<ToggleButtonGroupContext>('ToggleButtonGroup', null)
