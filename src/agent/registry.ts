import type { AgentNode } from './types'
import { accessibleName } from './label.js'

export interface AgentEntry {
  ref: string
  /** Registration order. A component mounts before its wrapper, so the larger one is the outer. */
  order: number
  node: AgentNode
}

const entries = new Map<string, AgentEntry>()
let count = 0
let order = 0

export function registerAgentNode(node: AgentNode): () => void {
  const ref = `c${++count}`
  entries.set(ref, { ref, order: ++order, node })

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

// A wrapper that renders another registered component's own root, like a number input
// over a text field, reports that element twice; the wrapper is the one a person reads.
export function agentVisibleEntries(): AgentEntry[] {
  const all = agentEntries()

  return all.filter((entry) => {
    const el = entry.node.el()

    if (!el) {
      return true
    }

    return !all.some(
      (other) => other !== entry && other.order > entry.order && other.node.el() === el,
    )
  })
}
