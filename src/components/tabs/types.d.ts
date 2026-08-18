export type TabsValue = string | number

export interface TabsProps {
  variant?: 'default' | 'secondary' | 'segmented'
  keepAlive?: boolean
  modelValue?: TabsValue
}

export interface TabsEmits {
  change: [TabsValue]
  'update:modelValue': [TabsValue]
}
