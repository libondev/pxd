import type { EmitFn } from 'vue'

import type { ChoiceboxEmits, ChoiceboxProps } from '../components/choicebox/types'

import { createContext } from '../utils/context'

interface ChoiceboxContext {
  props: ChoiceboxProps
  emits: EmitFn<ChoiceboxEmits>
}

export const [provideChoiceboxContext, useChoiceboxContext] =
  createContext<ChoiceboxContext>('ChoiceboxGroup')
