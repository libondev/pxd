import type { ComponentAs, ComponentDirection, ResponsiveValue } from '../../types/shared/props'

type Align = 'start' | 'end' | 'center' | 'stretch'
type Justify = Align | 'between' | 'around' | 'evenly'

export interface StackProps {
  as?: ComponentAs
  gap?: ResponsiveValue<string | number>
  wrap?: boolean
  scale?: number
  align?: Align
  justify?: Justify
  direction?: ResponsiveValue<ComponentDirection>
}
