import type { ComponentValue } from '../../types/shared'

export interface TabsProps {
  variant?: 'default' | 'secondary' | 'segmented'
  keepAlive?: boolean
  modelValue?: ComponentValue
}

export interface TabsEmits {
  change: [NonNullable<ComponentValue>]
  'update:modelValue': [NonNullable<ComponentValue>]
}
