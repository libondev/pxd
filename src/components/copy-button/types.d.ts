import type { ComponentText } from '../../types/shared/props'

export interface CopyButtonProps {
  text?: ComponentText | ((ev: PointerEvent) => ComponentText)
}

export interface CopyButtonEmits {
  copy: [string, PointerEvent]
  error: [unknown, PointerEvent]
}
