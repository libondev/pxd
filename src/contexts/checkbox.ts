import type { CheckboxGroupProps } from '../components/checkbox/types'

import { createContext } from '../utils/context'

export const [provideCheckboxGroupContext, useCheckboxGroupContext] =
  createContext<CheckboxGroupProps>('CheckboxGroup', null)
