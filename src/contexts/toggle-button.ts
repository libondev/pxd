import type { Ref } from 'vue'

import type { ToggleButtonGroupProps } from '../components/toggle-button/types'
import type { ComponentValue } from '../types/shared/props'

import { createContext } from '../utils/context'

export const [provideToggleButtonGroupContext, useToggleButtonGroupContext] =
  createContext<ToggleButtonGroupProps>('ToggleButtonGroup', null)

export const [provideToggleButtonGroupModelValue, useToggleButtonGroupModelValue] = createContext<
  Ref<ComponentValue | ComponentValue[]>
>('ToggleButtonGroupModelValue', null)
