import type { ComponentPosition, ComponentLabel } from '../../types/shared/props'
import type { Awaitable } from '../../types/shared/utils'
import type { ButtonVariant } from '../button/types'

export type ConfirmBeforeConfirm = () => Awaitable<boolean | void>

export interface ConfirmPopoverProps {
  modelValue?: boolean
  title?: ComponentLabel
  description?: ComponentLabel
  confirmText?: ComponentLabel
  cancelText?: ComponentLabel
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
