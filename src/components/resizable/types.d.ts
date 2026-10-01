import type { ComponentDirection } from '../../types/shared'

export interface PanelConfig {
  id?: string
  size?: number | null
  minSize?: number
  maxSize?: number
}

export interface ResizableProps {
  direction?: ComponentDirection
  modelValue?: number[] | null
}

export interface ResizableEmits {
  change: [number[]]
  reset: [number[]]
  'update:modelValue': [number[]]
}
