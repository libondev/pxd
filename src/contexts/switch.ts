import type { Ref } from 'vue'

import type { SwitchGroupProps } from '../components/switch/types'

import { createContext } from '../utils/context'

export const [provideSwitchGroupContext, useSwitchGroupContext] =
  createContext<SwitchGroupProps>('SwitchGroup')

export const [provideSwitchGroupModelValue, useSwitchGroupModelValue] =
  createContext<Ref<SwitchGroupProps['modelValue']>>('SwitchGroupModalValue')
