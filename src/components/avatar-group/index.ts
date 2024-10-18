import type { AvatarProps } from '../avatar'

export interface AvatarGroupProps {
  max?: number
  gap?: number | string
  size?: number | string
  members: AvatarProps[]
}

export { default } from './src/avatar-group.vue'
