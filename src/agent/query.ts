import type { AgentEntry } from './registry.js'
import { buttonsOf, fold, nameOf, safeItems, valueText, wordsOf } from './describe.js'
import { isHidden } from './marks.js'
import {
  agentEntries,
  agentElement,
  agentLabelSafe,
  agentMarkElement,
  agentRow,
  agentVisibleEntries,
} from './registry.js'

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

/** A component as a person would point at it: its ref, its name and its row. */
export const describeEntry = (entry: AgentEntry) =>
  [entry.ref, agentLabelSafe(entry.node) ?? entry.node.name, agentRow(entry)]
    .filter(Boolean)
    .join(' ')

// A component a step may still act on: it takes that action, and it is not disabled.
function can(entry: AgentEntry, action: string) {
  if (action === 'press') {
    return true
  }

  try {
    const state = entry.node.state?.() ?? {}

    return (
      state.disabled !== true &&
      state.readonly !== true &&
      typeof entry.node.actions[action] === 'function'
    )
  } catch {
    return false
  }
}

// How a name that matched more than one component is settled: the one that takes this
// action, the one holding the button a press names, then the one that is already open, then
// no guess at all.
function settle(candidates: AgentEntry[], ref: string, action?: string, text?: string) {
  if (candidates.length === 1) {
    return candidates[0]
  }

  const able = action ? candidates.filter((entry) => can(entry, action)) : candidates

  if (able.length === 1) {
    return able[0]
  }

  // A field nested in a wrapper answers to the same name, like a more button's own button:
  // the name a person reads belongs to the component around it.
  const outer = candidates.filter((entry) => {
    const el = agentElement(entry)

    return (
      !!el &&
      candidates.every((other) => {
        if (other === entry) {
          return true
        }

        const inside = agentElement(other)

        return !!inside && el.contains(inside)
      })
    )
  })

  if (outer.length === 1) {
    return outer[0]
  }

  if (action === 'press' && text) {
    const wanted = fold(text)
    const holding = able.filter((entry) =>
      buttonsOf(agentElement(entry)).some((el) => fold(nameOf(el)) === wanted),
    )

    if (holding.length === 1) {
      return holding[0]
    }
  }

  const open = able.filter((entry) => {
    try {
      return entry.node.state?.().open === true
    } catch {
      return false
    }
  })

  if (open.length === 1) {
    return open[0]
  }

  throw new Error(
    `"${ref}" names ${candidates.length} components: ${candidates
      .map(describeEntry)
      .join(', ')}. Use a ref.`,
  )
}

// A ref, then a name a person reads, then a choice inside it, then its kind — the ways a
// model names a component without reading its ref.
export function findAgentTarget(
  ref: string,
  action?: string,
  text?: string,
): { entry: AgentEntry } | { error: string } {
  const shown = agentShownEntries()
  const byRef = shown.find((entry) => entry.ref === ref)

  if (byRef) {
    return { entry: byRef }
  }

  const needle = fold(ref)
  const words = wordsOf(ref).trim()
  const labelOf = (entry: AgentEntry) => agentLabelSafe(entry.node)

  const named = shown.filter((entry) => {
    const label = labelOf(entry)

    if (label && fold(label) === needle) {
      return true
    }

    return !!words && wordsOf(`${label ?? ''} ${agentRow(entry) ?? ''}`).includes(` ${words} `)
  })

  if (named.length) {
    try {
      return { entry: settle(named, ref, action, text) }
    } catch (error) {
      return { error: (error as Error).message }
    }
  }

  const withItem = shown.filter((entry) =>
    safeItems(entry).some(
      (item) => item.label !== undefined && fold(String(item.label)) === needle,
    ),
  )

  if (withItem.length) {
    try {
      return { entry: settle(withItem, ref, action, text) }
    } catch (error) {
      return { error: (error as Error).message }
    }
  }

  const ofKind = shown.filter(
    (entry) => fold(entry.node.name) === needle || fold(entry.node.name).endsWith(`-${needle}`),
  )

  if (ofKind.length) {
    try {
      return { entry: settle(ofKind, ref, action, text) }
    } catch (error) {
      return { error: (error as Error).message }
    }
  }

  // A component inside `data-agent-hidden` is named as unavailable, so the agent stops
  // looking and asks the person instead of trying another way in.
  const offLimits = agentEntries().some((entry) => {
    if (!isHidden(agentMarkElement(entry))) {
      return false
    }

    const label = agentLabelSafe(entry.node)

    if (label && fold(label) === needle) {
      return true
    }

    return !!words && wordsOf(`${label ?? ''} ${agentRow(entry) ?? ''}`).includes(` ${words} `)
  })

  if (offLimits) {
    return { error: `"${ref}" isn't available to agents here. Ask the person.` }
  }

  const labels = shown
    .map((entry) => labelOf(entry))
    .filter(Boolean)
    .slice(0, 30)
  const closed = shown
    .filter((entry) => entry.node.reveals)
    .map((entry) => `${entry.node.name} (${entry.ref})`)

  return {
    error: `No component matches "${ref}".${
      labels.length ? ` Its labels: ${[...new Set(labels)].join(', ')}.` : ''
    }${closed.length ? ` It may be inside a closed section a step can open first: ${closed.join(', ')}.` : ''}`,
  }
}

// The ref, or the name exactly one component answers to. Used where an error would only be
// dropped, like `query`'s `within`.
export function resolveAgentEntry(ref: string): AgentEntry | undefined {
  const found = findAgentTarget(ref)

  return 'entry' in found ? found.entry : undefined
}

/** The choices inside one component that match `text`, read past the snapshot's cut. */
export function itemsMatching(entry: AgentEntry, text?: string) {
  const needle = text ? fold(text) : undefined
  const items = safeItems(entry)

  if (!needle) {
    return items
  }

  return items.filter(
    (item) =>
      (item.label !== undefined && fold(valueText(item.label)).includes(needle)) ||
      (item.value !== undefined && fold(valueText(item.value)).includes(needle)),
  )
}

export function findAgentEntries({
  text,
  within,
  kind,
}: { text?: string; within?: string; kind?: string } = {}): AgentMatch[] {
  const scope = within ? resolveAgentEntry(within) : undefined

  if (within && !scope) {
    return []
  }

  const scopeEl = scope ? agentElement(scope) : undefined
  const needle = text ? fold(text) : undefined
  const found: AgentMatch[] = []

  for (const entry of agentShownEntries()) {
    if (kind && entry.node.name !== kind) {
      continue
    }

    if (scope) {
      const el = agentElement(entry)

      if (!el || !scopeEl || !scopeEl.contains(el)) {
        continue
      }
    }

    let matches: (string | number)[] = []

    if (needle) {
      const label = agentLabelSafe(entry.node)
      const row = agentRow(entry)

      if (!label || !fold(label).includes(needle)) {
        if (!row || !fold(row).includes(needle)) {
          // A choice inside it matches too, so "the component holding Atlas" is findable even
          // when the label says something else. This reads the full list, not the first
          // ITEM_LIMIT the snapshot shows — matchedItems says which ones hit.
          matches = itemsMatching(entry, text).map((item) => item.label!)

          if (!matches.length) {
            continue
          }
        }
      }
    }

    found.push({ entry, matches })
  }

  return found
}
