interface AvatarGroupOptions {
  src?: string
  alt?: string
  loading?: boolean
}

export interface AvatarGroupProps {
  max?: number
  size?: number | string
  options?: AvatarGroupOptions[]
}
