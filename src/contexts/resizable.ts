import type { ResizableProps } from '../components/resizable/types'
import type { Ref } from 'vue'
import { createContext } from '../utils/context'

export interface ResizableContext {
  props: ResizableProps
  panelSizes: Ref<Record<string, number>>
  getPanelSize: (id: string) => number
  onHandleDrag: (key: string, delta: { deltaX: number; deltaY: number }) => void
  resetPanels: () => void
  registerPanel: (
    key: string,
    config: { size?: number | null; minSize?: number },
    el?: HTMLElement | null,
  ) => void
  registerHandle: (
    key: string,
    config: { onDrag: (delta: { deltaX: number; deltaY: number }) => void },
    el?: HTMLElement | null,
  ) => void
  unregisterPanel: (key: string) => void
  unregisterHandle: (key: string) => void
}

export const [provideResizableContext, useResizableContext] =
  createContext<ResizableContext>('ResizableContext')
