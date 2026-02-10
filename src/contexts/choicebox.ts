import type { Ref } from 'vue'

import type { ChoiceboxGroupProps } from '../components/choicebox/types'

import { createContext } from '../utils/context'

export const [provideChoiceboxGroupContext, useChoiceboxGroupContext] =
  createContext<ChoiceboxGroupProps>('ChoiceboxGroup', {
    multiple: false,
  })

export const [provideChoiceboxGroupModelValue, useChoiceboxGroupModelValue] = createContext<
  Ref<ChoiceboxGroupProps['modelValue']>
>('ChoiceboxGroupModalValue')
