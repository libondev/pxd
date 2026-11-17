import type { ChangeDetails } from '../types/shared/change'
import type { AgentChange, AgentChangeListener } from './types'
import { isHidden } from './marks.js'
import { agentEntryOf, agentLabel, agentOwnerEntry } from './registry.js'

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

  // Only the component a snapshot shows reports. An inner field whose wrapper owns the same
  // element stays silent — the wrapper announces the change it took from it — and a hidden
  // region says nothing at all.
  if (!entry || isHidden(entry.node.el()) || agentOwnerEntry(entry) !== entry) {
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
