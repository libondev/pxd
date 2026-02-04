import type { RadioGroupProps } from '../types/components/radio'

import { createContext } from '../utils/context'

export const [provideRadioGroupContext, useRadioGroupContext] = createContext<RadioGroupProps>(
  'RadioGroup',
  null,
)
