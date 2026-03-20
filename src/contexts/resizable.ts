import type { ResizableProps } from '../components/resizable/types'
import type { Ref } from 'vue'
import { createContext } from '../utils/context'

export interface ResizableContext {
  props: ResizableProps
  panelSizes: Ref<Record<string, number>>
  getPanelSize: (id: string) => number
  onHandleDrag: (id: string, delta: { deltaX: number; deltaY: number }) => void
  resetPanels: () => void
  registerPanel: (config: { id: string; size?: number | null; minSize?: number }) => void
  registerHandle: (config: {
    id: string
    onDrag: (delta: { deltaX: number; deltaY: number }) => void
  }) => void
  unregisterPanel: (id: string) => void
  unregisterHandle: (id: string) => void
}

export const [provideResizableContext, useResizableContext] =
  createContext<ResizableContext>('ResizableContext')
