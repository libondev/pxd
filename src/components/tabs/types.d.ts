import type { ChangeDetails, ChangeReason } from '../../types/shared/change'
import type { ComponentOption, ComponentValue } from '../../types/shared/props'

export type TabsChangeReason = Extract<ChangeReason, 'item-press'>

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
  change: [ComponentValue, details: ChangeDetails<TabsChangeReason>]
  'update:model-value': [ComponentValue]
}
