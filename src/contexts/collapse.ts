import { createContext } from '../utils/context'

export interface CollapseGroupContext {
  isExpanded: (id: string) => boolean
  toggleItem: (id: string, expanded: boolean) => void
}

export const [provideCollapseGroupContext, useCollapseGroupContext] =
  createContext<CollapseGroupContext>('CollapseGroup')
