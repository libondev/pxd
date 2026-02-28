import type { MessageItemHeightType, MessageItemType } from '../../composables/use-message'
import type { ComponentPosition } from '../../types/shared'

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
