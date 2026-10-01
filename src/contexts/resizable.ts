import type { PanelConfig, ResizableProps } from '../components/resizable/types'
import type { ComputedRef } from 'vue'
import { createContext } from '../utils/context.js'

export interface PanelBounds {
  min: number
  max: number
}

export interface PanelRange {
  prevIndex: number
  nextIndex: number
}

export interface ResizableContext {
  name: string
  props: ResizableProps
  sizes: ComputedRef<number[]>
  getPanelIndex: (key: string) => number
  getPanelId: (index: number) => string
  getPanelSize: (index: number) => number
  getPanelBounds: (index: number) => PanelBounds
  getContainerSize: () => number
  getPanelRange: (handleKey: string) => PanelRange | null
  registerPanel: (key: string, config: PanelConfig, el?: HTMLElement | null) => void
  unregisterPanel: (key: string) => void
  registerHandle: (key: string, el?: HTMLElement | null) => void
  unregisterHandle: (key: string) => void
  resizeByHandle: (handleKey: string, deltaPercent: number) => boolean
  isCollapsed: (handleKey: string) => boolean
  toggleCollapse: (handleKey: string) => void
  commitChange: () => void
  reset: (handleKey?: string) => void
}

export const [provideResizableContext, useResizableContext] =
  createContext<ResizableContext>('ResizableContext')
