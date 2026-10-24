import type {
  ComponentSize,
  ComponentVariantWithDefault,
  ComponentLabel,
} from '../../types/shared/props'

export interface SnippetProps {
  text?: ComponentLabel | ComponentLabel[]
  size?: ComponentSize
  prompt?: boolean | string
  copyBtn?: 'always' | 'hover' | 'hidden'
  variant?: ComponentVariantWithDefault | 'inverted' | 'ghost' | 'secondary'
}

export interface SnippetEmits {
  copy: [string]
}
