export interface CodeBlockProps {
  code: string
  language?: string
  title?: string
  size?: 'sm' | 'md' | 'lg'
  lineNumbers?: boolean
  maxHeight?: number | string
  collapsible?: boolean
  copyBtn?: 'always' | 'hover' | 'hidden'
}

export interface CodeBlockEmits {
  copy: [string]
}
