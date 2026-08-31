import type { StepsProps, StepsStatus } from '../components/steps/types'
import type { ShallowRef } from 'vue'
import { createContext } from '../utils/context.js'

export interface StepsItemState {
  id: string
  title?: string
  description?: string
  status?: StepsStatus
  disabled?: boolean
}

export interface StepsContext {
  props: StepsProps
  items: ShallowRef<StepsItemState[]>
  registerItem: (item: StepsItemState) => void
  unregisterItem: (id: string) => void
  updateItem: (item: StepsItemState) => void
  select: (index: number) => void
}

export const [provideStepsContext, useStepsContext] = createContext<StepsContext>('Steps')
