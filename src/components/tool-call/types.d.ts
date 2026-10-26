import type { ComponentText } from '../../types/shared/props'

export type ToolCallStatus = 'pending' | 'running' | 'completed' | 'error'
export type ToolCallVariant = 'default' | 'simple'

export interface ToolCallProps {
  title?: ComponentText
  variant?: ToolCallVariant
  status?: ToolCallStatus
  expand?: boolean
  input?: unknown
  output?: unknown
}
