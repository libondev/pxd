import type { ComponentOption, ComponentValue } from '../../types/shared/props'

export interface TabsOptions extends ComponentOption {
  label?: ComponentOption['label']
}

export interface TabsProps {
  variant?: 'default' | 'secondary' | 'segmented'
  keepAlive?: boolean
  modelValue?: ComponentValue
  defaultValue?: ComponentValue
  options: TabsOptions[]
}

export interface TabsEmits {
  change: [NonNullable<ComponentValue>]
  'update:model-value': [NonNullable<ComponentValue>]
}
