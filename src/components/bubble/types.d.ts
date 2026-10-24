export interface BubbleProps {
  role?: 'user' | 'system' | 'assistant'
  text?: ComponentLabel
  header?: string
  avatar?: string
  loading?: boolean
  variant?: 'default' | 'ghost'
  interactive?: boolean
}
