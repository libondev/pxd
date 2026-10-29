import type { ComponentText, ComponentVariant } from '../../types/shared/props'

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'dismissed'

export type ApprovalDecision = Exclude<ApprovalStatus, 'pending'>

export type ApprovalCause = 'escape' | 'close' | 'timeout'

export interface ApprovalResult {
  status: ApprovalDecision
  cause?: ApprovalCause
  reason?: string
  remember?: boolean
}

export interface ApprovalCardProps {
  modelValue?: ApprovalStatus
  title?: ComponentText
  description?: ComponentText
  command?: string | string[]
  variant?: ComponentVariant
  loading?: boolean
  timeout?: number
  rememberable?: boolean
  rememberLabel?: ComponentText
  allowFeedback?: boolean
  closeOnPressEscape?: boolean
  disabled?: boolean
}

export interface ApprovalCardEmits {
  'update:model-value': [status: ApprovalStatus]
  decide: [result: ApprovalResult]
  approve: [result: ApprovalResult]
  reject: [result: ApprovalResult]
}
