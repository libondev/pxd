export type AvatarStatus = 'idle' | 'loading' | 'loaded' | 'error'

export interface AvatarProps {
  src?: string
  alt?: string
  dimension?: number | string
  loading?: boolean
  showPlaceholder?: boolean
}

export interface AvatarEmits {
  load: [Event]
  error: [Event]
  loadstart: [Event]
}
