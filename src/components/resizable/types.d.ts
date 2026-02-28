import type { ComponentDirection } from '../../types/shared'

export interface ResizableProps {
  direction?: ComponentDirection
}

export interface ResizablePanelProps {
  size?: number | null
  minSize?: number
}

export interface PanelConfig {
  id: string
  size?: number | null
  minSize?: number
  order: number
}

export interface HandleConfig {
  id: string
  order: number
  onDrag: (delta: { deltaX: number; deltaY: number }) => void
}
