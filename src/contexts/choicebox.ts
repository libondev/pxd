import type { EmitFn } from 'vue'

import type { ChoiceboxGroupEmits, ChoiceboxGroupProps } from '../components/choicebox-group/types'

import { createContext } from '../utils/context'

interface ChoiceboxGroupContext {
  props: ChoiceboxGroupProps
  emits: EmitFn<ChoiceboxGroupEmits>
}

export const [provideChoiceboxGroupContext, useChoiceboxGroupContext] =
  createContext<ChoiceboxGroupContext>('ChoiceboxGroup')
