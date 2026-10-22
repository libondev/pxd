export type ToolCallStatus = 'pending' | 'running' | 'completed' | 'error'

export interface ToolCallProps {
  name: string
  status?: ToolCallStatus
  expand?: boolean
  input?: unknown
  output?: unknown
}
