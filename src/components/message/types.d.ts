import type { MessageItemConfig } from '../../composables/use-message'
import type { ComponentPosition } from '../../types/shared/props'

export interface MessageProps {
  maxCount?: number
  width?: string | number
  group?: string
  expand?: boolean
  position?: ComponentPosition<'top' | 'bottom'>
}

export interface MessageEmits {
  close: [id: MessageItemConfig['id']]
}
