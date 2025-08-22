import type { ListOption } from '../types/components/list'
import { createContext } from '../utils/context'

export interface CommandMenuContext {
  registerCommandMenuItem: (data: ListOption) => void
  unregisterCommandMenuItem: (data: ListOption) => void
}

export const [
  provideCommandMenuContext,
  useCommandMenuContext,
] = createContext<CommandMenuContext>('CommandMenu')
