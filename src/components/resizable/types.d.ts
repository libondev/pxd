import type { ComponentDirection } from '../../types/shared/props'

export interface ResizableProps {
  direction?: ComponentDirection
  unit?: 'percent' | 'px'
  minSize?: number[]
  handle?: boolean
  disabled?: boolean
  defaultValue?: number[]
  modelValue?: number[] | null
}

export interface ResizableEmits {
  change: [number[]]
  reset: [number[]]
  'update:modelValue': [number[]]
}
