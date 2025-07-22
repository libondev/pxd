import type { CheckboxGroupProps } from '../types/components/checkbox'
import { createContext } from '../utils/context'

export const [
  provideCheckboxGroupContext,
  useCheckboxGroupContext,
] = createContext<CheckboxGroupProps>('CheckboxGroup', null)
