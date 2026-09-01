import type { ComponentDirection } from '../../types/shared'

export interface PanelConfig {
  id: string
  size?: number | null
  minSize?: number
}

export interface HandleConfig {
  onDrag: (delta: { deltaX: number; deltaY: number }) => void
}

export interface ResizableProps {
  direction?: ComponentDirection
}
