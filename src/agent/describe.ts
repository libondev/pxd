import type { AgentEntry } from './registry.js'
import type { AgentComponent, AgentItem } from './types'
import { accessibleName } from './label.js'
import { confirmOf, isHidden, isSecret, REDACTED } from './marks.js'
import { agentElement, agentLabelSafe, agentMarkElement } from './registry.js'

// A snapshot has to stay readable to a model: a list of ten thousand rows would crowd out
// everything else, so items stop here and `itemCount` says how many there really are.
export const ITEM_LIMIT = 100

// How many of the choices that made `query({ text })` match are named back to the caller.
export const MATCH_LIMIT = 10

// The keys the bridge owns. A component whose state carries one of them would overwrite
// what makes the entry addressable, so its own key is dropped instead.
const RESERVED = new Set([
  'ref',
  'component',
  'label',
  'actions',
  'buttons',
  'items',
  'itemCount',
  'matchedItems',
  'incomplete',
  'confirm',
])

export const fold = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()

export const textOf = (el: Element) => (el.textContent ?? '').replace(/\s+/g, ' ').trim()

// What a button is called: its accessible name first, so an icon-only button that carries
// aria-label is still pressable by the word a person hears.
export const nameOf = (el: Element) => accessibleName(el) ?? textOf(el)

// A component's items getter is its own code. A broken one must not take down a query, and
// snapshot marks the entry `incomplete` rather than pretending it reported everything.
export function safeItems(entry: AgentEntry): AgentItem[] {
  try {
    return entry.node.items?.() ?? []
  } catch {
    return []
  }
}

// The buttons a step can press: a closed popup renders nothing, so it can't be pressed
// until the step that opens it has rendered. A button inside a hidden region is not there
// either, even when the component around it is visible.
export function buttonsOf(el: Element | null | undefined) {
  if (!el) {
    return []
  }

  const root = el.matches('button, [role="button"]') ? [el as HTMLElement] : []

  return [...root, ...el.querySelectorAll<HTMLElement>('button, [role="button"]')].filter(
    (button) => !isHidden(button),
  )
}

export function describe(entry: AgentEntry): AgentComponent {
  try {
    return buildComponent(entry)
  } catch {
    return { ref: entry.ref, component: entry.node.name, actions: [], incomplete: true }
  }
}

function buildComponent(entry: AgentEntry): AgentComponent {
  const { ref, node } = entry
  const el = agentElement(entry)
  const markEl = agentMarkElement(entry)
  const component: AgentComponent = { ref, component: node.name, actions: [] }

  // The password-field check only makes sense on the component's own root. When a dialog
  // renders nothing, its scope is the parent container, whose other fields are not its own.
  const secret = isSecret(el) || !!markEl?.closest('[data-agent-secret]')

  // A secret component reports no text at all: a list of account names or a labelled
  // button is as revealing as the value. It stays addressable and driveable by ref.
  if (!secret) {
    const label = agentLabelSafe(node)

    if (label) {
      component.label = label
    }
  }

  let failed = false

  try {
    for (const [key, value] of Object.entries(node.state?.() ?? {})) {
      if (!RESERVED.has(key)) {
        component[key] = secret ? REDACTED : value
      }
    }
  } catch {
    failed = true
  }

  const confirm = confirmOf(markEl)

  if (confirm) {
    component.confirm = confirm
  }

  if (!secret) {
    const buttons = buttonsOf(el).map(nameOf).filter(Boolean)

    if (buttons.length) {
      component.buttons = buttons
    }
  }

  let items: AgentItem[] = []

  try {
    items = node.items?.() ?? []
  } catch {
    failed = true
  }

  if (items.length && !secret) {
    component.items = items.slice(0, ITEM_LIMIT)

    if (items.length > ITEM_LIMIT) {
      component.itemCount = items.length
    }
  }

  component.actions = Object.keys(node.actions)

  if (failed) {
    component.incomplete = true
  }

  return component
}
