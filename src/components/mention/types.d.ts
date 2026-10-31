import type { ComponentClass, ComponentSize } from '../../types/shared/props'
import type { ListFilterMethodFn, ListOptionSelected, ListOptions } from '../list/types'

export type MentionRemoteFilterFn = (
  query: string,
  trigger: string,
) => ListOptions | Promise<ListOptions>

export type MentionOptionsResolver = (trigger: string) => ListOptions | Promise<ListOptions>

export interface MentionProps {
  modelValue?: string
  options?: ListOptions | MentionOptionsResolver
  triggers?: string[]
  size?: ComponentSize
  virtual?: boolean
  filterMethod?: ListFilterMethodFn
  remoteFilter?: MentionRemoteFilterFn
  filterDebounce?: boolean
  placeholder?: string
  searchPlaceholder?: string
  disabled?: boolean
  closeOnPressEscape?: boolean
  submitOnEnter?: boolean
  rows?: number
  autoGrow?: boolean
  maxRows?: number
  editorClass?: ComponentClass
  editorAttrs?: Record<string, unknown>
  beforeInsert?: (payload: MentionSelectPayload) => boolean | void
}

export interface MentionClickPayload {
  key: string
  label: string
  trigger: string
  event: MouseEvent
}

export interface MentionTokenMention {
  key: string
  label: string
  trigger: string
}

export type MentionHtmlToken =
  | { type: 'text'; text: string }
  | (MentionTokenMention & { type: 'mention' })

export interface MentionHtmlToTextOptions {
  chipText?: (mention: MentionTokenMention) => string
}

export interface MentionSelectPayload {
  key: string
  label: string
  trigger: string
  item: ListOptionSelected
}

export interface MentionEmits {
  change: [string]
  submit: [string]
  select: [MentionSelectPayload]
  'mention-click': [MentionClickPayload]
  'update:model-value': [string]
}
