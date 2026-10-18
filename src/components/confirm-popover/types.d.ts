import type { ComponentPosition } from '../../types/shared/props'
import type { Awaitable } from '../../types/shared/utils'
import type { ButtonVariant } from '../button/types'

export type ConfirmBeforeConfirm = () => Awaitable<boolean | void>

export interface ConfirmPopoverProps {
  modelValue?: boolean
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  confirmVariant?: ButtonVariant
  position?: ComponentPosition
  disabled?: boolean
  beforeConfirm?: ConfirmBeforeConfirm
}

export interface ConfirmPopoverEmits {
  confirm: []
  cancel: []
  'update:modelValue': [visible: boolean]
}
