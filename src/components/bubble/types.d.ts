export interface BubbleProps {
  role?: 'user' | 'system' | 'assistant'
  text?: ComponentText
  header?: string
  avatar?: string
  loading?: boolean
  variant?: 'default' | 'ghost' | 'primary' | 'secondary'
  interactive?: boolean
}
