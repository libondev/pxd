import type { ButtonVariant } from '../../types/components/button'
import type { ChangeDetails } from '../../types/shared/change'
import type { ComponentSize, ComponentShape } from '../../types/shared/props'
import type {
  ListFilterMethodFn,
  ListModelValue,
  ListOption,
  ListOptions,
  ListRemoteFilterFn,
} from '../list/types'

export interface SelectProps {
  size?: ComponentSize
  shape?: ComponentShape
  variant?: ButtonVariant
  options?: ListOptions
  virtual?: boolean
  disabled?: boolean
  multiple?: boolean
  modelValue?: ListModelValue
  suffixIcon?: boolean
  placeholder?: string
  filterable?: boolean
  filterPlaceholder?: string
  filterMethod?: ListFilterMethodFn
  remoteFilter?: ListRemoteFilterFn
  labelFormat?: (items: ListOptions) => string
  closeOnPressEscape?: boolean
}

export interface SelectEmits {
  change: [ListModelValue, details: ChangeDetails]
  'update:model-value': [ListModelValue]
}
