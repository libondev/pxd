import type { ComponentLabel } from '../../types/shared/props'

export interface CopyButtonProps {
  text?: ComponentLabel | ((ev: PointerEvent) => ComponentLabel)
}

export interface CopyButtonEmits {
  copy: [string, PointerEvent]
}
