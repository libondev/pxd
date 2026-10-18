import type { BasePosition } from '../../types/shared/props'

export type RevealTrigger = 'mount' | 'viewport'

export interface RevealProps {
  duration?: number | string
  delay?: number | string
  /** Initial offset along the reveal axis, before the element settles at its place. */
  distance?: number | string
  direction?: BasePosition
  trigger?: RevealTrigger
  root?: Element | Document | null
  rootMargin?: string
  threshold?: number | number[]
}
