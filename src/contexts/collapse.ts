import type { Ref } from 'vue'

import { createContext } from '../utils/context'

interface CollapseGroupContext {
  multiple: Ref<boolean>
  isExpanded: (id: string) => boolean
  toggleItem: (id: string, expanded: boolean) => void
}

export const [provideCollapseGroupContext, useCollapseGroupContext] =
  createContext<CollapseGroupContext>('CollapseGroup')
