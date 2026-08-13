export interface BubbleProps {
  role?: 'user' | 'system' | 'assistant'
  text?: string
  header?: string
  avatar?: string
  loading?: boolean
  variant?: 'default' | 'ghost'
}
