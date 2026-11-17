import type { AgentActOptions, AgentActResult, AgentAllow } from './types'

export type AgentCall = (
  options: AgentActOptions,
  allow?: AgentAllow,
  signal?: AbortSignal,
) => Promise<AgentActResult>

// Each bridge's `act`, with a second `allow` beside its own, for `registerTools`.
export const agentCallers = new WeakMap<object, AgentCall>()
