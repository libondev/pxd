import type { ButtonVariant } from '../../types/components/button'
import type { ChangeDetails, ChangeReason } from '../../types/shared/change'
import type { ComponentClass, ComponentSizeWithXs, ComponentShape } from '../../types/shared/props'
import type {
  ListFilterMethodFn,
  ListModelValue,
  ListOption,
  ListOptions,
  ListRemoteFilterFn,
} from '../list/types'

export type SelectChangeReason = Extract<ChangeReason, 'cleared' | 'item-press'>

export interface SelectProps {
  size?: ComponentSizeWithXs
  id?: string
  shape?: ComponentShape
  triggerClass?: ComponentClass
  variant?: ButtonVariant
  invalid?: boolean
  options?: ListOptions
  virtual?: boolean
  disabled?: boolean
  multiple?: boolean
  modelValue?: ListModelValue
  suffixIcon?: boolean
  placeholder?: string
  filterable?: boolean
  matchWidth?: boolean
  clearable?: boolean
  searchPlaceholder?: string
  filterMethod?: ListFilterMethodFn
  remoteFilter?: ListRemoteFilterFn
  labelFormat?: (items: ListOptions) => string
}

export interface SelectEmits {
  change: [ListModelValue, details: ChangeDetails<SelectChangeReason>]
  'update:model-value': [ListModelValue]
  retry: []
}
