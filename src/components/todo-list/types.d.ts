import type { ChangeDetails } from '../../types/shared/change'
import type { ComponentText, ComponentSize } from '../../types/shared/props'

export type TodoListStatus = 'pending' | 'in_progress' | 'completed' | 'canceled'
export type TodoListVariant = 'default' | 'simple'

export type TodoListItemKey = string | number

export interface TodoListOption {
  id?: TodoListItemKey
  content?: ComponentText
  description?: ComponentText
  status?: TodoListStatus
  disabled?: boolean
}

export interface TodoListChangeDetail {
  item: TodoListOption
  index: number
  status: TodoListStatus
  prevStatus: TodoListStatus
  options: TodoListOption[]
}

export interface TodoListStats {
  pending: number
  inProgress: number
  completed: number
  canceled: number
  total: number
}

export interface TodoListProps {
  variant?: TodoListVariant
  size?: ComponentSize
  options?: TodoListOption[]
  modelValue?: TodoListOption[]
  defaultValue?: TodoListOption[]
  readonly?: boolean
  expand?: boolean
  heading?: ComponentText
  empty?: ComponentText
}

export interface TodoListEmits {
  change: [TodoListChangeDetail, details: ChangeDetails]
  'update:model-value': [TodoListOption[]]
}
