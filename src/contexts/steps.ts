import type { StepsProps, StepsStatus } from '../components/steps/types'
import type { OrderedChild } from '../composables/_internal/use-ordered-children'
import type { ShallowRef } from 'vue'
import { createContext } from '../utils/context.js'

export interface StepsItemState {
  title?: string
  description?: string
  status?: StepsStatus
  disabled?: boolean
}

export interface StepsContext {
  props: StepsProps
  items: ShallowRef<OrderedChild<StepsItemState>[]>
  registerItem: (key: string, item: StepsItemState, el?: HTMLElement | null) => void
  unregisterItem: (key: string) => void
  select: (index: number) => void
}

export const [provideStepsContext, useStepsContext] = createContext<StepsContext>('Steps')
