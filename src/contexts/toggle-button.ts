import type {
  ToggleButtonGroupProps,
  ToggleButtonGroupEmits,
} from '../components/toggle-button-group/types'
import type { EmitFn } from 'vue'
import { createContext } from '../utils/context.js'

export interface ToggleButtonGroupContext {
  props: ToggleButtonGroupProps
  emits: EmitFn<ToggleButtonGroupEmits>
}

export const [provideToggleButtonGroupContext, useToggleButtonGroupContext] =
  createContext<ToggleButtonGroupContext>('ToggleButtonGroup', null)
