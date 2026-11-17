import type { AgentEntry } from './registry.js'
import type { AgentComponent, AgentItem, AgentSnapshotOptions } from './types'
import { accessibleName, textOf } from './label.js'
import { confirmOf, isHidden, REDACTED, sourceOf } from './marks.js'
import {
  agentElement,
  agentLabelSafe,
  agentMarkElement,
  agentRow,
  agentSecret,
} from './registry.js'

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
  'row',
  'actions',
  'buttons',
  'items',
  'itemCount',
  'matchedItems',
  'incomplete',
  'confirm',
  'pending',
  'error',
  'text',
  'offPage',
  'source',
  'more',
  'use',
  'sample',
])

export const fold = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()

// Folded text as its words between single spaces, with one at each end, so a match lands on
// whole words and "name" finds "Display name" but not "Username".
export const wordsOf = (text: string) => ` ${fold(text)} `.replace(/[^\p{L}\p{N}]+/gu, ' ')

/** Any value as text: an object by its contents, since every object reads "[object Object]". */
export const valueText = (value: unknown) => {
  if (value == null) {
    return ''
  }

  if (typeof value === 'string') {
    return value
  }

  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
    return String(value)
  }

  if (typeof value === 'symbol') {
    return value.toString()
  }

  return JSON.stringify(value) ?? ''
}

// What a button is called: its accessible name first, so an icon-only button that carries
// aria-label is still pressable by the word a person hears.
export const nameOf = (el: Element) => accessibleName(el) ?? textOf(el)

export const messageOf = (error: unknown) =>
  error instanceof Error ? error.message : String(error)

/** Whether the component says it cannot be used now, as a step must not act on it. */
export function agentDisabled(entry: AgentEntry): boolean {
  try {
    const state = entry.node.state?.() ?? {}

    return state.disabled === true || state.readonly === true
  } catch {
    return false
  }
}

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
// until the step that opens it has rendered. A button inside a hidden region, an inert one
// or a hidden link is not there either, even when the component around it is visible.
export function buttonsOf(el: Element | null | undefined) {
  if (!el) {
    return []
  }

  const selector = 'button, [role="button"], a[href]'
  const root = el.matches(selector) ? [el as HTMLElement] : []

  return [...root, ...el.querySelectorAll<HTMLElement>(selector)].filter(
    (button) => !isHidden(button) && !button.closest('[inert]'),
  )
}

// What a component says about itself besides its name, like a dialog's description, read
// from the element its own `aria-describedby` points at.
function describedText(el: Element | null): string | undefined {
  const ids = el?.getAttribute('aria-describedby')

  if (!ids) {
    return
  }

  const doc = el!.ownerDocument
  const text = ids
    .split(/\s+/)
    .map((id) => textOf(doc.getElementById(id)))
    .filter(Boolean)
    .join(' ')

  return text || undefined
}

export function describe(
  entry: AgentEntry,
  { items: withItems = true }: AgentSnapshotOptions = {},
): AgentComponent {
  try {
    return buildComponent(entry, withItems)
  } catch {
    return { ref: entry.ref, component: entry.node.name, actions: [], incomplete: true }
  }
}

function buildComponent(entry: AgentEntry, withItems: boolean): AgentComponent {
  const { ref, node } = entry
  const el = agentElement(entry)
  const markEl = agentMarkElement(entry)
  const secret = agentSecret(entry)
  const component: AgentComponent = { ref, component: node.name, actions: [] }

  // A secret component reports no text at all: a list of account names or a labelled
  // button is as revealing as the value. It stays addressable and driveable by ref.
  if (!secret) {
    const label = agentLabelSafe(node)

    if (label) {
      component.label = label
    }

    const row = agentRow(entry)

    if (row) {
      component.row = row
    }

    const source = sourceOf(el)

    if (source) {
      component.source = source
    }

    const text = describedText(el)

    if (text) {
      component.text = [text]
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

  // With `items: false` the getter is not even read: a long list costs a model the most, and
  // `query({ within })` reads one list at a time. A secret component's choices are never
  // reported either, so they are not read for it.
  if (withItems && !secret) {
    let items: AgentItem[] = []

    try {
      items = node.items?.() ?? []
    } catch {
      failed = true
    }

    if (items.length) {
      component.items = items.slice(0, ITEM_LIMIT)

      if (items.length > ITEM_LIMIT) {
        component.itemCount = items.length
      }
    }
  }

  try {
    if (node.pending?.() === true) {
      component.pending = true
    }
  } catch {
    failed = true
  }

  try {
    const failure = node.error?.()

    if (failure != null) {
      component.error = secret ? REDACTED : messageOf(failure)
    }
  } catch {
    failed = true
  }

  const disabled = component.disabled === true || component.readonly === true

  component.actions = disabled ? [] : Object.keys(node.actions)

  if (failed) {
    component.incomplete = true
  }

  return component
}
