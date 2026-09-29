import type { CheckboxGroupProps, CheckboxGroupEmits } from '../components/checkbox-group/types'
import type { EmitFn } from 'vue'
import { createContext } from '../utils/context.js'

export interface CheckboxGroupContext {
  props: CheckboxGroupProps
  emits: EmitFn<CheckboxGroupEmits>
}

export const [provideCheckboxGroupContext, useCheckboxGroupContext] =
  createContext<CheckboxGroupContext>('CheckboxGroup', null)
