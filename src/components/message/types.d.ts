import type { MessageItemType } from '../../composables/use-message'
import type { ComponentPosition } from '../../types/shared/props'

export interface MessageProps {
  max?: number
  width?: string | number
  group?: string
  expand?: boolean
  position?: ComponentPosition<'top' | 'bottom'>
}

export interface MessageEmits {
  close: [id: MessageItemType['id']]
}

export interface MessageItemProps {
  max: number
  index: number
  itemData: MessageItemType
}

export interface MessageItemEmits {
  close: [key: MessageItemType['id']]
  'set-height': [info: MessageItemHeightType]
}
