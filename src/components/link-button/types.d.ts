export interface LinkButtonProps {
  href: string
  text?: string
  align?: 'left' | 'center' | 'right'
  target?: '_blank' | '_self' | '_parent' | '_top'
  externalIcon?: boolean
}

export interface LinkButtonEmits {
  click: [MouseEvent]
}
