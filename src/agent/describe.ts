import type { AgentEntry } from './registry.js'
import type { AgentComponent } from './types'
import { accessibleName } from './label.js'
import { confirmOf, isSecret, REDACTED } from './marks.js'
import { agentLabel } from './registry.js'

// A snapshot has to stay readable to a model: a list of ten thousand rows would crowd out
// everything else, so items stop here and `itemCount` says how many there really are.
export const ITEM_LIMIT = 100

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

// The buttons a step can press: a closed popup renders nothing, so it can't be pressed
// until the step that opens it has rendered.
export function buttonsOf(el: Element | null | undefined) {
  if (!el) {
    return []
  }

  const root = el.matches('button, [role="button"]') ? [el as HTMLElement] : []

  return [...root, ...el.querySelectorAll<HTMLElement>('button, [role="button"]')]
}

export function describe(entry: AgentEntry): AgentComponent {
  const { ref, node } = entry
  const el = node.el()
  const component: AgentComponent = { ref, component: node.name, actions: [] }

  const label = agentLabel(node)

  if (label) {
    component.label = label
  }

  const secret = isSecret(el)

  for (const [key, value] of Object.entries(node.state?.() ?? {})) {
    if (!RESERVED.has(key)) {
      component[key] = secret ? REDACTED : value
    }
  }

  const confirm = confirmOf(el)

  if (confirm) {
    component.confirm = confirm
  }

  const buttons = buttonsOf(el).map(nameOf).filter(Boolean)

  if (buttons.length) {
    component.buttons = buttons
  }

  const items = node.items?.() ?? []

  if (items.length) {
    component.items = items.slice(0, ITEM_LIMIT)

    if (items.length > ITEM_LIMIT) {
      component.itemCount = items.length
    }
  }

  component.actions = Object.keys(node.actions)

  return component
}
