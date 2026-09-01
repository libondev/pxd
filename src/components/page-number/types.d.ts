import type { ComponentSize, ComponentOption } from '../../types/shared'

export interface PageNumberProps {
  /** page */
  modelValue?: number
  pageSize?: number
  size?: ComponentSize
  total?: number
  disabled?: boolean
  showPageSize?: boolean
  showQuickJumper?: boolean
  pageSizeOptions?: number[]
}

export interface PageNumberEmits {
  'update:pageSize': [page: number]
  'update:modelValue': [page: number]
}
