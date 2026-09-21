import type { ComponentSize } from '../../types/shared/props'
import type { ListOptions } from '../list/types'

export type MentionFilterMethod = (
  query: string,
) => ListOptions | Promise<ListOptions>

export interface MentionProps {
  modelValue?: string
  options?: ListOptions
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
  event: MouseEvent
}

export interface MentionEmits {
  change: [string]
  'mention-click': [MentionClickPayload]
  'update:modelValue': [string]
}
