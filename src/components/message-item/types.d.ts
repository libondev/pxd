import type { MessageItemType, MessageItemHeightType } from "../../composables/use-message"

export interface MessageItemProps {
  max: number
  index: number
  itemData: MessageItemType
}

export interface MessageItemEmits {
  close: [key: MessageItemType['id']]
  'set-height': [info: MessageItemHeightType]
}
