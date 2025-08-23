import type { Ref } from 'vue'
import { createContext } from '../utils/context'

export interface CommandMenuContext {
  filterKeyword: Ref<string>
  filterKeywordRegex: Ref<RegExp | null>
}

export const [
  provideCommandMenuContext,
  useCommandMenuContext,
] = createContext<CommandMenuContext>('CommandMenu')
