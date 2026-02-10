import type { ButtonVariant } from '../button/types'

export interface LinkButtonProps {
  href: string
  text?: string
  align?: 'left' | 'center' | 'right'
  target?: HTMLAnchorElement['target']
  variant?: ButtonVariant
  externalIcon?: boolean
}

export interface LinkButtonEmits {
  click: [MouseEvent]
}
