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

// A descriptor's getters are component code. One of them failing must not take down the
// whole snapshot, so every read the bridge does goes through these.
export function agentElement(entry: AgentEntry): Element | null {
  try {
    return entry.node.el() ?? null
  } catch {
    return null
  }
}

// Where an entry's `data-agent-*` marks live. `el` is the component's own root; `scope` is
// its Vue anchor's parent, which is the only place left when a dialog renders nothing.
export function agentMarkElement(entry: AgentEntry): Element | null {
  try {
    return entry.node.el() ?? entry.node.scope?.() ?? null
  } catch {
    return null
  }
}

export function agentLabel(node: AgentNode): string | undefined {
  return node.label?.() || accessibleName(node.el())
}

export function agentLabelSafe(node: AgentNode): string | undefined {
  try {
    return agentLabel(node)
  } catch {
    return undefined
  }
}

// A wrapper that renders another registered component's own root, like a number input over
// a text field, holds that element too; the wrapper is the one a person reads, so it owns
// the entry. Everything about visibility and reporting is this one rule.
export function agentOwnerEntry(entry: AgentEntry): AgentEntry {
  const el = agentElement(entry)

  if (!el) {
    return entry
  }

  const same = agentEntries().filter(
    (other) => other.order > entry.order && agentElement(other) === el,
  )

  return same[same.length - 1] ?? entry
}

export function agentVisibleEntries(): AgentEntry[] {
  return agentEntries().filter((entry) => agentOwnerEntry(entry) === entry)
}
