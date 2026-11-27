interface AvatarOptions {
  src?: string
  alt?: string
  loading?: boolean
}

export interface AvatarGroupProps {
  maxCount?: number
  dimension?: number | string
  options?: AvatarOptions[]
}
