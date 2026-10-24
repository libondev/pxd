import type { ComponentLabel } from '../../types/shared/props'

export type ToolCallStatus = 'pending' | 'running' | 'completed' | 'error'
export type ToolCallVariant = 'default' | 'simple'

export interface ToolCallProps {
  title?: ComponentLabel
  variant?: ToolCallVariant
  status?: ToolCallStatus
  expand?: boolean
  input?: unknown
  output?: unknown
}
