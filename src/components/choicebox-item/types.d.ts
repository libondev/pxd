import type { ComponentText, ComponentValue } from '../../types/shared/props'

export interface ChoiceboxItemProps {
  label?: ComponentText
  value: ComponentValue
  disabled?: boolean
  description?: string
}
