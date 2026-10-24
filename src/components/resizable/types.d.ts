import type { ComponentDirection } from '../../types/shared/props'

export type ResizableDblclickAction = 'reset' | 'fold'

export interface ResizableProps {
  direction?: ComponentDirection
  unit?: 'percent' | 'px'
  reverse?: boolean
  minSize?: number[]
  collapsed?: boolean | null
  dblclickAction?: ResizableDblclickAction
  handle?: boolean
  disabled?: boolean
  defaultValue?: number[]
  modelValue?: number[] | null
}

export interface ResizableEmits {
  change: [number[]]
  reset: [number[]]
  'update:collapsed': [boolean]
  'update:model-value': [number[]]
}
