import type { ComponentLabel, ComponentValue } from '../../types/shared/props'

export interface ChoiceboxItemProps {
  label?: ComponentLabel
  value: ComponentValue
  disabled?: boolean
  description?: string
}
