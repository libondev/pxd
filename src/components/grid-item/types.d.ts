import type { ResponsiveValue } from '../../types/shared'

export interface GridItemProps {
  row?: ResponsiveValue<string | number>
  column?: ResponsiveValue<string | number>
}
