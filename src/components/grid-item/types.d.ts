import type { ResponsiveValue } from '../../types/shared/props'

export interface GridItemProps {
  row?: ResponsiveValue<string | number>
  column?: ResponsiveValue<string | number>
}
