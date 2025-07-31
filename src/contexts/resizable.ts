import type { Ref } from 'vue'
import { createContext } from '../utils/context'

interface PanelConfig {
  id: string
  order: number
  size?: number | null
  minSize?: number
}

export interface ResizableContext {
  direction: Ref<'horizontal' | 'vertical'>
  panelSizes: Ref<number[]>
  panelConfigs: Ref<PanelConfig[]>
  getPanelSize: (id: string) => number
  onHandleDrag: (id: string, delta: { deltaX: number, deltaY: number }) => void
  registerPanel: (config: { id: string, size?: number | null, minSize?: number }) => void
  registerHandle: (config: { id: string, onDrag: (delta: { deltaX: number, deltaY: number }) => void }) => void
  unregisterPanel: (id: string) => void
  unregisterHandle: (id: string) => void
}

export const [
  provideResizableContext,
  useResizableContext,
] = createContext<ResizableContext>('ResizableContext')
