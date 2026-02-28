import type { ButtonVariant } from '../button/types'

export interface LinkButtonProps {
  href: string
  text?: string
  align?: 'left' | 'center' | 'right'
  target?: '_blank' | '_self' | '_parent' | '_top'
  variant?: ButtonVariant
  externalIcon?: boolean
}

export interface LinkButtonEmits {
  click: [MouseEvent]
}
