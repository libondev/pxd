import type { ComponentText, ComponentSize } from '../../types/shared/props'

export type TodoStatus = 'pending' | 'in_progress' | 'completed' | 'canceled'
export type TodoVariant = 'default' | 'simple'

/** Key accepted by the imperative methods: an option `id`, or its index. */
export type TodoItemKey = string | number

export interface TodoOption {
  /** Stable key for rendering and for the imperative methods; falls back to the index. */
  id?: TodoItemKey
  /** Main label. Named after `todo_write`'s field so agent output can be bound directly. */
  content?: ComponentText
  description?: ComponentText
  status?: TodoStatus
  disabled?: boolean
}

export interface TodoChangeDetail {
  item: TodoOption
  index: number
  status: TodoStatus
  prevStatus: TodoStatus
  options: TodoOption[]
}

export interface TodoStats {
  pending: number
  inProgress: number
  completed: number
  canceled: number
  total: number
}

export interface TodoProps {
  variant?: TodoVariant
  /** Padding, font and marker size; falls back to the config provider size. */
  size?: ComponentSize
  /** Items to render while uncontrolled; `modelValue` takes precedence. */
  options?: TodoOption[]
  modelValue?: TodoOption[]
  defaultValue?: TodoOption[]
  /** Render as a static list: no status buttons, no row click. */
  readonly?: boolean
  /** Expanded state, applied whenever the value changes. */
  expand?: boolean
  /** Header title; falls back to `locale.todo.title`. */
  title?: ComponentText
  /** Empty-state text; falls back to `locale.results.noData`. */
  empty?: ComponentText
}

export interface TodoEmits {
  change: [TodoChangeDetail]
  'update:model-value': [TodoOption[]]
}
