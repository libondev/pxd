import type { ComponentSize, ComponentVariantWithDefault } from '../../types/shared'

export interface SnippetProps {
  text?: string | string[] | null
  size?: ComponentSize
  prompt?: boolean | string
  copyBtn?: 'always' | 'hover' | 'hidden'
  variant?: ComponentVariantWithDefault | 'inverted' | 'ghost' | 'secondary'
}

export interface SnippetEmits {
  copy: [string]
}
