export interface PageNumberProps {
  /** page */
  modelValue?: number
  pageSize?: number
  total?: number
  disabled?: boolean
  showQuickJumper?: boolean
}

export interface PageNumberEmits {
  'update:modelValue': [page: number]
}
