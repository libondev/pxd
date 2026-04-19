import type { ComponentLabel } from '../../types/shared'
import type { TabsValue } from '../tabs/types'

export interface TabsItemProps {
  label?: ComponentLabel
  value: TabsValue
  disabled?: boolean
}

export interface TabsItemEmits {}
