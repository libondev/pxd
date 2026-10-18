import type { ResponsiveValue } from '../../types/shared/props'

export interface GridProps {
  debug?: boolean
  rows?: ResponsiveValue<string | number>
  columns?: ResponsiveValue<string | number>
}
