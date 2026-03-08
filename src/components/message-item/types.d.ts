import type { MessageItemConfig } from '../../composables/use-message'

export interface MessageItemProps {
  max: number
  index: number
  itemData: MessageItemConfig
}

export interface MessageItemEmits {
  close: [key: MessageItemConfig['id']]
}
