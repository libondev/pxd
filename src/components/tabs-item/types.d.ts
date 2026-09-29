import type { ComponentLabel, ComponentValue } from '../../types/shared'

export interface TabsItemProps {
  label?: ComponentLabel
  value: ComponentValue
  disabled?: boolean
}

export interface TabsItemEmits {}
