import type { ComponentOption, ComponentValue } from '../../types/shared'

export interface TabsProps {
  variant?: 'default' | 'secondary' | 'segmented'
  keepAlive?: boolean
  modelValue?: ComponentValue
  defaultValue?: ComponentValue
  options: ComponentOption[]
}

export interface TabsEmits {
  change: [NonNullable<ComponentValue>]
  'update:modelValue': [NonNullable<ComponentValue>]
}
