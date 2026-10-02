import type { ComponentLabel } from '../../types/shared'

export type TodoStatus = 'pending' | 'in_progress' | 'completed' | 'canceled'

/** Key accepted by the imperative methods: an option `id`, or its index. */
export type TodoItemKey = string | number

export interface TodoOption {
  /** Stable key for rendering and for the imperative methods; falls back to the index. */
  id?: TodoItemKey
  /** Main label. Named after `todo_write`'s field so agent output can be bound directly. */
  content?: ComponentLabel
  description?: ComponentLabel
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
  /** Items to render while uncontrolled; `modelValue` takes precedence. */
  options?: TodoOption[]
  modelValue?: TodoOption[]
  defaultValue?: TodoOption[]
  /** Render as a static list: no status buttons, no row click. */
  readonly?: boolean
  collapsible?: boolean
  defaultExpanded?: boolean
  /** Header title; falls back to `locale.todo.title`. */
  title?: ComponentLabel
  /** Empty-state text; falls back to `locale.results.noData`. */
  empty?: ComponentLabel
}

export interface TodoEmits {
  change: [TodoChangeDetail]
  'update:modelValue': [TodoOption[]]
  toggle: [expanded: boolean, event: MouseEvent]
}
