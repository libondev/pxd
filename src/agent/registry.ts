import type { AgentNode } from './types'
import { accessibleName } from './label.js'
import { isHidden, isSecret, MARKS } from './marks.js'

export interface AgentEntry {
  ref: string
  /** Registration order. A component mounts before its wrapper, so the larger one is the outer. */
  order: number
  node: AgentNode
}

/** What a component showed when it left the page, so an agent can still check it. */
export interface AgentOffPage {
  ref: string
  component: string
  label?: string
  row?: string
  state: Record<string, unknown>
  /** The registration count when it left: a bridge only reports what left while it watched. */
  at: number
}

const entries = new Map<string, AgentEntry>()
// Which component instance a change came from, so a report can name it without the call
// site passing anything.
const entriesByInstance = new WeakMap<object, AgentEntry>()
// Refs of components that left, by what named them, so one that comes back keeps its ref.
const retired = new Map<string, string[]>()
// What those components showed when they left, so a closed tab's field still reports.
const offPage = new Map<string, AgentOffPage>()
const warned = new Set<string>()

const RETIRED_LIMIT = 500
const OFF_PAGE_LIMIT = 50
let count = 0
let order = 0
let tick = 0

// What names a component on its row: the text it reports itself, else what its neighbours say.
function rowOfNode(node: AgentNode): string | undefined {
  try {
    return node.row?.() || rowOf(safeElement(node))
  } catch {
    return rowOf(safeElement(node))
  }
}

// A surface the bridge already registered, by what names it, so a ref follows the component.
function keyOf(node: AgentNode): string {
  return `${node.name}|${agentLabelSafe(node) ?? ''}|${rowOfNode(node) ?? ''}`
}

function safeElement(node: AgentNode): Element | null {
  try {
    return node.el() ?? null
  } catch {
    return null
  }
}

// A misspelled mark does nothing, so development says which one it saw.
function warnMarks(el: Element) {
  const dev = (import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV

  if (!dev) {
    return
  }

  for (let node: Element | null = el; node; node = node.parentElement) {
    for (const { name } of node.attributes) {
      if (name.startsWith('data-agent-') && !MARKS.has(name) && !warned.has(name)) {
        warned.add(name)
        console.warn(`[pxd] "${name}" is not an agent mark, so nothing reads it.`)
      }
    }
  }
}

function rememberOffPage(entry: AgentEntry) {
  const el = safeElement(entry.node)

  if (isSecret(el) || isHidden(el)) {
    return
  }

  let state: Record<string, unknown>

  try {
    state = entry.node.state?.() ?? {}
  } catch {
    return
  }

  const kept: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(state)) {
    if (key !== 'open') {
      kept[key] = value
    }
  }

  if (!Object.keys(kept).length) {
    return
  }

  const record: AgentOffPage = {
    ref: entry.ref,
    component: entry.node.name,
    state: kept,
    at: ++tick,
  }
  const label = agentLabelSafe(entry.node)
  const row = rowOf(el)

  if (label) {
    record.label = label
  }

  if (row) {
    record.row = row
  }

  offPage.delete(record.ref)
  offPage.set(record.ref, record)

  if (offPage.size > OFF_PAGE_LIMIT) {
    offPage.delete(offPage.keys().next().value!)
  }
}

export function registerAgentNode(node: AgentNode, owner?: object): () => void {
  const el = safeElement(node)
  const key = el ? keyOf(node) : undefined
  const queue = key ? retired.get(key) : undefined
  const reused = queue?.shift()

  if (queue && !queue.length) {
    retired.delete(key!)
  }

  const ref = reused ?? `c${++count}`
  const entry: AgentEntry = { ref, order: ++order, node }

  if (reused) {
    offPage.delete(ref)
  }

  entries.set(ref, entry)

  if (owner) {
    entriesByInstance.set(owner, entry)
  }

  if (el) {
    warnMarks(el)
  }

  return () => {
    entries.delete(ref)

    if (owner && entriesByInstance.get(owner) === entry) {
      entriesByInstance.delete(owner)
    }

    if (key) {
      const refs = retired.get(key)

      if (refs) {
        refs.push(ref)
      } else {
        retired.set(key, [ref])
      }

      if (retired.size > RETIRED_LIMIT) {
        retired.delete(retired.keys().next().value!)
      }
    }

    rememberOffPage(entry)
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

/** The components that left the page after `since`, with what they showed. */
export function agentOffPage(since: number): AgentOffPage[] {
  return [...offPage.values()].filter((record) => record.at > since)
}

/** The registration count now, which a bridge keeps to know what left while it watched. */
export function agentTick(): number {
  return tick
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

// Text in the component's row that is not its own, like the name beside a table row's menu,
// so an agent can tell two identical menus apart.
export function rowOf(el: Element | null | undefined): string | undefined {
  if (!el) {
    return
  }

  const row = el.closest('li, tr, [role="row"], [role="listitem"]')

  if (!row || row === el || !row.contains(el)) {
    return
  }

  const own = [el, ...((el as HTMLInputElement).labels ?? [])]
  const words: string[] = []

  const walk = (node: Node) => {
    for (const child of node.childNodes) {
      if (child.nodeType === 3) {
        const text = child.textContent?.trim()

        if (text && !own.some((el) => el.contains(child))) {
          words.push(text)
        }
      } else if (
        child instanceof Element &&
        child.getAttribute('aria-hidden') !== 'true' &&
        !child.hasAttribute('data-agent-hidden') &&
        !own.some((el) => el.contains(child))
      ) {
        walk(child)
      }
    }
  }

  walk(row)

  return words.join(' ').slice(0, 80) || undefined
}

// What names a component on its row: the text it reports itself, else what its neighbours say.
export function agentRow(entry: AgentEntry): string | undefined {
  return rowOfNode(entry.node)
}

// A password, one-time code or card field, or one inside `data-agent-secret`: its value
// never reaches an agent, though a step may still write it.
export function agentSecret(entry: AgentEntry): boolean {
  try {
    return (
      isSecret(agentElement(entry)) || !!agentMarkElement(entry)?.closest('[data-agent-secret]')
    )
  } catch {
    return false
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
