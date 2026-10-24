export interface CodeBlockSwitcherOption {
  label?: string
  value: string
}

export interface CodeBlockSwitcherProps {
  options: CodeBlockSwitcherOption[]
  value?: string
}

export interface CodeBlockProps {
  code: string
  language?: string
  title?: string
  size?: 'sm' | 'md' | 'lg'
  lineNumbers?: boolean
  highlightedLines?: number[]
  addedLines?: number[]
  removedLines?: number[]
  maxHeight?: number | string
  collapsible?: boolean
  copyBtn?: 'always' | 'hover' | 'hidden'
  switcher?: CodeBlockSwitcherProps
  tabs?: CodeBlockSwitcherProps
}

export interface CodeBlockEmits {
  copy: [string]
  'switcher-change': [string]
  'tabs-change': [string]
}
