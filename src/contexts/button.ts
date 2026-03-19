import type { ButtonGroupProps } from '../components/button-group/types'
import { createContext } from '../utils/context'

export interface ButtonGroupContext {
  props: ButtonGroupProps
}

export const [provideButtonGroupContext, useButtonGroupContext] = createContext<ButtonGroupContext>(
  'ButtonGroup',
  null,
)
