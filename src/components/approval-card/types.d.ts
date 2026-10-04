import type { ComponentLabel, ComponentVariant } from '../../types/shared'

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'dismissed'

export type ApprovalDecision = Exclude<ApprovalStatus, 'pending'>

export type ApprovalCause = 'escape' | 'close' | 'timeout'

export interface ApprovalResult {
  status: ApprovalDecision
  /** Only set on `dismissed`: separates an active skip from the timeout that ends the wait. */
  cause?: ApprovalCause
  reason?: string
  remember?: boolean
}

export interface ApprovalCardProps {
  modelValue?: ApprovalStatus
  /** Fallback title; renders `locale.approval.title`. */
  title?: ComponentLabel
  description?: ComponentLabel
  command?: string | string[]
  variant?: ComponentVariant
  loading?: boolean
  /** Milliseconds before an undecided card dismisses itself; `0` never times out. */
  timeout?: number
  rememberable?: boolean
  closeOnPressEscape?: boolean
  disabled?: boolean
}

export interface ApprovalCardEmits {
  'update:modelValue': [status: ApprovalStatus]
  decide: [result: ApprovalResult]
  approve: [result: ApprovalResult]
  reject: [result: ApprovalResult]
}
