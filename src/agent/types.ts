export interface AgentNode {
  name: string
  el: () => Element | null | undefined
  label?: () => string | undefined
  state?: () => Record<string, unknown>
  actions: Record<string, (...args: any[]) => unknown>
}

export interface AgentComponent {
  /** What a step's `ref` and `query`'s `within` take. Stable while the component stays on the page. */
  ref: string
  component: string
  label?: string
  [state: string]: unknown
  /** The text of the buttons inside it, for a `press` step. */
  buttons?: string[]
  actions: string[]
}

export interface AgentStep {
  ref: string
  action: string
  args?: any[]
}

export interface AgentStepResult {
  ref: string
  result: unknown
}

export interface AgentActResult {
  ok: boolean
  results: AgentStepResult[]
  error?: { message: string; ref?: string }
}
