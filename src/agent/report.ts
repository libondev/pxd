import type { ChangeDetails } from '../types/shared/change'
import type { AgentChange, AgentChangeListener } from './types'
import { isHidden } from './marks.js'
import { agentEntryOf, agentLabel } from './registry.js'

const listeners = new Set<AgentChangeListener>()

export function subscribeAgentChanges(listener: AgentChangeListener) {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}

// Tells subscribers that a registered component changed, whoever caused it. Nothing is
// built while nobody listens, so a page without a subscriber pays only a size check.
export function notifyAgentChange(owner: object, value: unknown, details?: ChangeDetails) {
  if (!listeners.size) {
    return
  }

  const entry = agentEntryOf(owner)

  if (!entry || isHidden(entry.node.el())) {
    return
  }

  const change: AgentChange = { ref: entry.ref, component: entry.node.name, value, details }
  const label = agentLabel(entry.node)

  if (label) {
    change.label = label
  }

  // A Set survives deletion during its own iteration, so a listener may unsubscribe here.
  for (const listener of listeners) {
    listener(change)
  }
}
