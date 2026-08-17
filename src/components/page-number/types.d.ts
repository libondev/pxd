import type { ComponentSize } from '../../types/shared'

export interface PageNumberProps {
  /** page */
  modelValue?: number
  pageSize?: number
  total?: number
  disabled?: boolean
  showQuickJumper?: boolean
  size?: ComponentSize
}

export interface PageNumberEmits {
  'update:modelValue': [page: number]
}
