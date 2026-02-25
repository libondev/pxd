import type { ComponentAs, ComponentSize } from '../../types/shared'

export type BadgeVariant =
  | 'pill'
  | 'primary'
  | 'gray'
  | 'blue'
  | 'purple'
  | 'amber'
  | 'red'
  | 'pink'
  | 'green'
  | 'teal'
  | 'gray-subtle'
  | 'blue-subtle'
  | 'purple-subtle'
  | 'amber-subtle'
  | 'red-subtle'
  | 'pink-subtle'
  | 'green-subtle'
  | 'teal-subtle'
  | 'inverted'
  | 'vue'
  | 'trial'
  | 'turborepo'

export interface BadgeProps {
  as?: ComponentAs
  href?: string
  size?: ComponentSize
  variant?: BadgeVariant
}
