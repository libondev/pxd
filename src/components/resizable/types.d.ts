import type { ComponentDirection } from '../../types/shared'

export interface PanelConfig {
  id: string
  size?: number | null
  order: number
  minSize?: number
}

export interface HandleConfig {
  id: string
  order: number
  onDrag: (delta: { deltaX: number; deltaY: number }) => void
}

export interface ResizableProps {
  direction?: ComponentDirection
}
