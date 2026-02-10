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

interface AvatarOptions {
  src?: string
  alt?: string
  loading?: boolean
}

export interface AvatarGroupProps {
  max?: number
  size?: number | string
  options?: AvatarOptions[]
}
