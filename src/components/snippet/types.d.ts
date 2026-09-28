import type { ComponentSize, ComponentVariantWithDefault } from '../../types/shared'

export interface SnippetProps {
  text?: string | string[] | null
  size?: ComponentSize
  prompt?: boolean | string
  variant?: ComponentVariantWithDefault | 'inverted'
}

export interface SnippetEmits {
  copy: [string]
}
