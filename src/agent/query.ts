import type { AgentEntry } from './registry.js'
import type { AgentQuery } from './types'
import { fold } from './describe.js'
import { isHidden } from './marks.js'
import { agentEntry, agentLabel, agentVisibleEntries } from './registry.js'

// The components an agent may see: registered, not inside a hidden region, and not the
// inner element of a wrapper that owns the same root.
export function agentShownEntries(): AgentEntry[] {
  return agentVisibleEntries().filter((entry) => !isHidden(entry.node.el()))
}

// A ref, or the name exactly one component answers to.
export function resolveAgentEntry(ref: string): AgentEntry | undefined {
  const byRef = agentEntry(ref)

  if (byRef) {
    return byRef
  }

  const needle = fold(ref)
  const named = agentShownEntries().filter((entry) => {
    const label = agentLabel(entry.node)

    return !!label && fold(label) === needle
  })

  if (named.length === 1) {
    return named[0]
  }

  // A field nested in a wrapper answers to the same name, like a number input's own text
  // field: the name a person reads belongs to the component around it.
  const outer = named.filter((entry) => {
    const own = entry.node.el()

    return !!own && named.every((other) => other === entry || own.contains(other.node.el()!))
  })

  return outer.length === 1 ? outer[0] : undefined
}

export function findAgentEntries({ text, within, kind }: AgentQuery = {}): AgentEntry[] {
  const scope = within ? resolveAgentEntry(within)?.node.el() : undefined

  if (within && !scope) {
    return []
  }

  const needle = text ? fold(text) : undefined

  return agentShownEntries().filter((entry) => {
    if (kind && entry.node.name !== kind) {
      return false
    }

    if (scope) {
      const el = entry.node.el()

      if (!el || !scope.contains(el)) {
        return false
      }
    }

    if (needle) {
      const label = agentLabel(entry.node)

      if (label && fold(label).includes(needle)) {
        return true
      }

      // A choice inside it matches too, so "the component holding Atlas" is findable even
      // when the label says something else.
      return (entry.node.items?.() ?? []).some(
        (item) => item.label !== undefined && fold(String(item.label)).includes(needle),
      )
    }

    return true
  })
}
