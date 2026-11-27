import type { ComponentText } from '../../types/shared/props'

export interface CodeBlockSwitcherOption {
  label?: string
  value: string
}

export interface CodeBlockSwitcherProps {
  options: CodeBlockSwitcherOption[]
  value?: string
}

export interface CodeBlockProps {
  content: string
  language?: string
  heading?: ComponentText
  size?: 'sm' | 'md' | 'lg'
  lineNumbers?: boolean
  highlightedLines?: number[]
  addedLines?: number[]
  removedLines?: number[]
  maxHeight?: number | string
  collapsible?: boolean
  copyBtn?: 'always' | 'hover' | 'hidden'
  switcher?: CodeBlockSwitcherProps
  switcherMode?: 'select' | 'tabs'
}

export interface CodeBlockEmits {
  copy: [string]
  'switcher-change': [string]
}
