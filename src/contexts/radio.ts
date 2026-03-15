import type { RadioGroupEmits, RadioGroupProps } from '../components/radio-group/types'
import type { EmitFn } from 'vue'
import { createContext } from '../utils/context'

export interface RadioGroupContext {
  name: string
  props: RadioGroupProps
  emits: EmitFn<RadioGroupEmits>
}

export const [provideRadioGroupContext, useRadioGroupContext] = createContext<RadioGroupContext>(
  'RadioGroup',
  null,
)
