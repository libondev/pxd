import type { AgentNode } from './types'
import { accessibleName } from './label.js'

export interface AgentEntry {
  ref: string
  /** Registration order. A component mounts before its wrapper, so the larger one is the outer. */
  order: number
  node: AgentNode
}

const entries = new Map<string, AgentEntry>()
// Which component instance a change came from, so a report can name it without the call
// site passing anything.
const entriesByInstance = new WeakMap<object, AgentEntry>()
let count = 0
let order = 0

export function registerAgentNode(node: AgentNode, owner?: object): () => void {
  const ref = `c${++count}`
  const entry: AgentEntry = { ref, order: ++order, node }

  entries.set(ref, entry)

  if (owner) {
    entriesByInstance.set(owner, entry)
  }

  return () => {
    entries.delete(ref)

    if (owner && entriesByInstance.get(owner) === entry) {
      entriesByInstance.delete(owner)
    }
  }
}

export function agentEntries(): AgentEntry[] {
  return [...entries.values()]
}

export function agentEntry(ref: string): AgentEntry | undefined {
  return entries.get(ref)
}

export function agentEntryOf(owner: object): AgentEntry | undefined {
  return entriesByInstance.get(owner)
}

export function agentLabel(node: AgentNode): string | undefined {
  return node.label?.() || accessibleName(node.el())
}

// The entry a change should be reported under: a wrapper that renders another registered
// component's own root holds that element too, and the wrapper is the one a person reads.
export function agentOwnerEntry(entry: AgentEntry): AgentEntry {
  const el = entry.node.el()

  if (!el) {
    return entry
  }

  const same = agentEntries().filter((other) => other.order > entry.order && other.node.el() === el)

  return same[same.length - 1] ?? entry
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
