export type AvatarStatus = 'idle' | 'loading' | 'loaded' | 'error'

export interface AvatarProps {
  src?: string
  alt?: string
  size?: number | string
  loading?: boolean
  placeholder?: boolean
}

export interface AvatarEmits {
  load: [Event]
  error: [Event]
  loadstart: [Event]
}
