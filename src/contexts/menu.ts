import type { Ref } from 'vue'
import { createContext } from '../utils/context'

export interface MenuListContext {
  activeIndex: Ref<number>
  onOptionClick: (ev: MouseEvent, index: number) => void
  registerMenuItem: (el: HTMLElement) => void
  unregisterMenuItem: (el: HTMLElement) => void
}

export const [
  provideMenuListContext,
  useMenuListContext,
] = createContext<MenuListContext>('MenuList')
