export type ToolCallStatus = 'pending' | 'running' | 'completed' | 'error'

export interface ToolCallProps {
  name: string
  status?: ToolCallStatus
  input?: unknown
  output?: unknown
}
