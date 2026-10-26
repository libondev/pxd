import type {
  ComponentSize,
  ComponentVariantWithDefault,
  ComponentText,
} from '../../types/shared/props'

export interface SnippetProps {
  text?: ComponentText | ComponentText[]
  size?: ComponentSize
  prompt?: boolean | string
  copyBtn?: 'always' | 'hover' | 'hidden'
  variant?: ComponentVariantWithDefault | 'inverted' | 'ghost' | 'secondary'
}

export interface SnippetEmits {
  copy: [string]
}
