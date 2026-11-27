import type { MessageItemConfig } from '../../composables/use-message'

export interface MessageItemProps {
  maxCount: number
  index: number
  offset?: number
  itemData: MessageItemConfig
}

export interface MessageItemEmits {
  close: [key: MessageItemConfig['id']]
}
