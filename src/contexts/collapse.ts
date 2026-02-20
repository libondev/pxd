import type { Ref } from 'vue'

import type { CollapseGroupProps } from '../components/collapse-group/types'
import { createContext } from '../utils/context'

export interface CollapseGroupContext {
  expandedIds: Ref<Set<string>>
  props: CollapseGroupProps
}

export const [provideCollapseGroupContext, useCollapseGroupContext] =
  createContext<CollapseGroupContext>('CollapseGroup')
