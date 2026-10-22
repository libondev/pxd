export type ToolCallStatus = 'pending' | 'running' | 'completed' | 'error'
export type ToolCallVariant = 'default' | 'simple'

export interface ToolCallProps {
  name: string
  variant?: ToolCallVariant
  status?: ToolCallStatus
  expand?: boolean
  input?: unknown
  output?: unknown
}
