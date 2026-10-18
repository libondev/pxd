import type { BasePosition } from '../../types/shared/props'

export interface DashLineProps {
  position?: BasePosition | BasePosition[]
  lineSize?: string | number
  dashSize?: string | number
  color?: string
  gap?: string | number
}
