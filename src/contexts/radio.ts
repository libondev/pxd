import type { RadioGroupProps } from '../components/radio/types'

import { createContext } from '../utils/context'

export const [provideRadioGroupContext, useRadioGroupContext] = createContext<RadioGroupProps>(
  'RadioGroup',
  null,
)
