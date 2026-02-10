import type { ComponentSize, ComponentVariantWithDefault } from '../../types/shared'

export interface SnippetProps {
  text: string | string[]
  width?: string | number
  size?: ComponentSize
  prompt?: boolean | string
  variant?: ComponentVariantWithDefault
}

export interface SnippetEmits {
  copy: [string]
}
