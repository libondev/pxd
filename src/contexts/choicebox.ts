import type { Ref } from 'vue'

import type { ChoiceboxGroupProps } from '../types/components/choicebox'

import { createContext } from '../utils/context'

export const [provideChoiceboxGroupContext, useChoiceboxGroupContext] =
  createContext<ChoiceboxGroupProps>('ChoiceboxGroup', {
    multiple: false,
  })

export const [provideChoiceboxGroupModelValue, useChoiceboxGroupModelValue] = createContext<
  Ref<ChoiceboxGroupProps['modelValue']>
>('ChoiceboxGroupModalValue')
