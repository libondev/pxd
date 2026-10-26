import type { ComponentPosition, ComponentText } from '../../types/shared/props'
import type { Awaitable } from '../../types/shared/utils'
import type { ButtonVariant } from '../button/types'

export type ConfirmBeforeConfirm = () => Awaitable<boolean | void>

export interface ConfirmPopoverProps {
  modelValue?: boolean
  title?: ComponentText
  description?: ComponentText
  confirmText?: ComponentText
  cancelText?: ComponentText
  confirmVariant?: ButtonVariant
  position?: ComponentPosition
  disabled?: boolean
  triggerSelector?: string
  beforeConfirm?: ConfirmBeforeConfirm
}

export interface ConfirmPopoverEmits {
  confirm: []
  cancel: []
  'update:model-value': [visible: boolean]
}
