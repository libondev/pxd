import type { BasePosition } from '../../types/shared'

export interface DashLineProps {
  position?: BasePosition | BasePosition[]
  lineSize?: string | number
  dashSize?: string | number
  color?: string
  gap?: string | number
}
