export interface CopyButtonProps {
  text?: string | ((ev: PointerEvent) => string)
}

export interface CopyButtonEmits {
  copy: [string, PointerEvent]
}
