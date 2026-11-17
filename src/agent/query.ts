import type { AgentEntry } from './registry.js'
import type { AgentQuery } from './types'
import { fold, safeItems } from './describe.js'
import { isHidden } from './marks.js'
import { agentEntry, agentLabelSafe, agentMarkElement, agentVisibleEntries } from './registry.js'

export interface AgentMatch {
  entry: AgentEntry
  /** The choice labels that made `text` match, including ones past `ITEM_LIMIT`. */
  matches: (string | number)[]
}

// The components an agent may see: registered, not inside a hidden region, and not the
// inner element of a wrapper that owns the same root.
export function agentShownEntries(): AgentEntry[] {
  return agentVisibleEntries().filter((entry) => !isHidden(agentMarkElement(entry)))
}

// A ref, or the name exactly one component answers to.
export function resolveAgentEntry(ref: string): AgentEntry | undefined {
  const byRef = agentEntry(ref)

  // A ref obeys the same boundary as a name: hidden means not on the page at all.
  if (byRef && !isHidden(agentMarkElement(byRef))) {
    return byRef
  }

  const needle = fold(ref)
  const named = agentShownEntries().filter((entry) => {
    const label = agentLabelSafe(entry.node)

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

export function findAgentEntries({ text, within, kind }: AgentQuery = {}): AgentMatch[] {
  const scope = within ? resolveAgentEntry(within)?.node.el() : undefined

  if (within && !scope) {
    return []
  }

  const needle = text ? fold(text) : undefined
  const found: AgentMatch[] = []

  for (const entry of agentShownEntries()) {
    if (kind && entry.node.name !== kind) {
      continue
    }

    if (scope) {
      const el = entry.node.el()

      if (!el || !scope.contains(el)) {
        continue
      }
    }

    let matches: (string | number)[] = []

    if (needle) {
      const label = agentLabelSafe(entry.node)

      if (!label || !fold(label).includes(needle)) {
        // A choice inside it matches too, so "the component holding Atlas" is findable even
        // when the label says something else. This reads the full list, not the first
        // ITEM_LIMIT the snapshot shows — matchedItems says which ones hit.
        matches = safeItems(entry)
          .filter((item) => item.label !== undefined && fold(String(item.label)).includes(needle))
          .map((item) => item.label!)

        if (!matches.length) {
          continue
        }
      }
    }

    found.push({ entry, matches })
  }

  return found
}
