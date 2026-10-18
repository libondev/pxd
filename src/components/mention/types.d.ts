import type { ComponentSize } from '../../types/shared/props'
import type { ListOptions } from '../list/types'

export type MentionFilterMethod = (
  query: string,
  trigger: string,
) => ListOptions | Promise<ListOptions>

export type MentionOptionsResolver = (trigger: string) => ListOptions

export interface MentionProps {
  modelValue?: string
  options?: ListOptions | MentionOptionsResolver
  triggers?: string[]
  size?: ComponentSize
  virtual?: boolean
  filterMethod?: MentionFilterMethod
  placeholder?: string
  searchPlaceholder?: string
  disabled?: boolean
  closeOnPressEscape?: boolean
}

export interface MentionClickPayload {
  key: string
  label: string
  trigger: string
  event: MouseEvent
}

export interface MentionEmits {
  change: [string]
  'mention-click': [MentionClickPayload]
  'update:modelValue': [string]
}
