export interface CopyButtonProps {
  text?: string | null
}

export interface CopyButtonEmits {
  copy: [CopyButtonProps['text'], PointerEvent]
}
