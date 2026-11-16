import type { AgentNode } from './types'
import { accessibleName } from './label.js'

export interface AgentEntry {
  ref: string
  node: AgentNode
}

const entries = new Map<string, AgentEntry>()
let count = 0

export function registerAgentNode(node: AgentNode): () => void {
  const ref = `c${++count}`
  entries.set(ref, { ref, node })

  return () => {
    entries.delete(ref)
  }
}

export function agentEntries(): AgentEntry[] {
  return [...entries.values()]
}

export function agentEntry(ref: string): AgentEntry | undefined {
  return entries.get(ref)
}

export function agentLabel(node: AgentNode): string | undefined {
  return node.label?.() || accessibleName(node.el())
}
