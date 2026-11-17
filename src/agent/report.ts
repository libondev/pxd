import type { ChangeDetails } from '../types/shared/change'
import type { AgentChange, AgentChangeListener } from './types'
import { isHidden, REDACTED } from './marks.js'
import {
  agentEntryOf,
  agentLabelSafe,
  agentMarkElement,
  agentOwnerEntry,
  agentRow,
  agentSecret,
} from './registry.js'

const listeners = new Set<AgentChangeListener>()

export function subscribeAgentChanges(listener: AgentChangeListener) {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}

// Which of a component's values changed. A checkbox reports `checked`, a dialog `open`,
// everything else `value`.
function keyOf(state: Record<string, unknown>) {
  if ('checked' in state) {
    return 'checked'
  }

  return 'open' in state && !('value' in state) ? 'open' : 'value'
}

// A password, one-time code or card field's value never reaches a listener, and a value of
// "[redacted]" can't be put back either.
const redact = (value: unknown, secret: boolean) =>
  secret && value !== '' && value != null ? REDACTED : value

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
  if (!entry || isHidden(agentMarkElement(entry)) || agentOwnerEntry(entry) !== entry) {
    return
  }

  const secret = agentSecret(entry)
  let state: Record<string, unknown> = {}

  try {
    state = entry.node.state?.() ?? {}
  } catch {
    state = {}
  }

  const key = keyOf(state)
  const change: AgentChange = {
    ref: entry.ref,
    component: entry.node.name,
    key,
    value: redact(value, secret),
    previous: redact(state[key], secret),
    details,
  }
  const label = agentLabelSafe(entry.node)
  const row = agentRow(entry)

  if (label) {
    change.label = label
  }

  if (row) {
    change.row = row
  }

  // A Set survives deletion during its own iteration, so a listener may unsubscribe here.
  for (const listener of listeners) {
    listener(change)
  }
}
