import type { InputProps } from '../input/types'

export interface SearchInputProps extends Pick<InputProps, 'modelValue' | 'disabled' | 'readonly'> {
  loading?: boolean
}

export interface SearchInputEmits {
  search: [string]
  'update:model-value': [string]
}
