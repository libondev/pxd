import type { ComponentAs, ComponentDirection, ResponsiveValue } from '../../types/shared'

type Align = 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly' | 'stretch'

export interface StackProps {
  as?: ComponentAs
  gap?: ResponsiveValue<string | number>
  wrap?: boolean
  scale?: number
  align?: Align
  justify?: Align
  direction?: ResponsiveValue<ComponentDirection>
}
