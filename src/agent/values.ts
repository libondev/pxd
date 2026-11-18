import type { AgentEntry } from './registry.js'
import type { AgentItem } from './types'
import { fold, valueText } from './describe.js'
import { REDACTED } from './marks.js'

// The actions whose argument names a value or a choice. Others, like `setQuery`, take text.
const CHOOSING = new Set(['setValue', 'setChecked', 'select'])

/** What one component showed, as a run remembers it before and after a step. */
export interface AgentFieldState {
  component: string
  label?: string
  secret: boolean
  state: Record<string, unknown>
}

// How many fields one `act` reports back before it starts counting what it left out.
const FIELD_LIMIT = 100

/**
 * Every field the run touched or that changed, so an agent checks its work without another
 * snapshot. A field it neither set nor saw change holds what it already knew, so it is left
 * out and `more` says how many such fields the page still has.
 */
export function valuesOf(
  states: Map<string, AgentFieldState>,
  touched: Set<string>,
  changed: Set<string>,
) {
  const fields: { name: string; value: unknown; included: boolean }[] = []

  for (const [ref, entry] of states) {
    if (entry.state.open === true) {
      continue
    }

    const key = 'checked' in entry.state ? 'checked' : 'value' in entry.state ? 'value' : undefined

    if (!key) {
      continue
    }

    const value = entry.state[key]

    fields.push({
      name: `${ref} ${entry.label ?? entry.component}`,
      value: entry.secret && value != null && value !== '' ? REDACTED : (value ?? null),
      included: touched.has(ref) || changed.has(ref),
    })
  }

  const kept = new Set<(typeof fields)[number]>()

  for (const field of fields) {
    if (!field.included) {
      continue
    }

    if (kept.size >= FIELD_LIMIT) {
      break
    }

    kept.add(field)
  }

  const out: Record<string, unknown> = {}

  for (const field of fields) {
    if (kept.has(field)) {
      out[field.name] = field.value
    }
  }

  if (fields.length > kept.size) {
    out.more = fields.length - kept.size
  }

  return out
}

const nameOfEntry = (entry: AgentEntry) => `${entry.node.name} ${entry.ref}`

// A value as a key, so an object is compared by its contents rather than by "[object Object]".
const keyOfValue = (value: unknown) =>
  value !== null && typeof value === 'object' ? JSON.stringify(value) : String(value)

// The state key an action writes: `setValue` writes `value`, `setOpen` writes `open`.
function actionKey(action: string) {
  return /^set[A-Z]/.test(action) ? action[3].toLowerCase() + action.slice(4) : undefined
}

// A checkbox's `setValue` writes `checked`, so a key the state does not carry falls back to
// the field it holds.
function fieldKey(state: Record<string, unknown>, action: string) {
  const key = actionKey(action)

  if (key && key in state) {
    return key
  }

  if ('checked' in state) {
    return 'checked'
  }

  return 'value'
}

const labelsOf = (items: AgentItem[]) =>
  items
    .slice(0, 20)
    .map((item) => valueText(item.label ?? item.value))
    .join(', ')

const held = (value: unknown, chosen: unknown) =>
  (Array.isArray(value) ? value : [value]).some(
    (item) => item != null && keyOfValue(item) === keyOfValue(chosen),
  )

// A value from an item's label, so an agent can write "Europe" without looking up "eu".
// A closed list refuses anything else and names the items it does have, unless the list
// already holds that value: a choice that is no longer offered stays, as a chip does.
function resolveLabel(
  entry: AgentEntry,
  items: AgentItem[],
  label: string,
  current: unknown,
): { value: unknown } | { error: string } {
  if (items.some((item) => keyOfValue(item.value) === keyOfValue(label))) {
    return { value: label }
  }

  const needle = fold(label)
  const found = items.filter(
    (item) => item.label !== undefined && fold(String(item.label)) === needle,
  )

  if (found.length === 1) {
    return { value: found[0].value }
  }

  if (found.length > 1) {
    return {
      error: `"${label}" names ${found.length} items in ${nameOfEntry(entry)}: ${found
        .map((item) => keyOfValue(item.value))
        .join(', ')}. Use a value.`,
    }
  }

  if (entry.node.closed && !held(current, label)) {
    return {
      error: `No item "${label}" in ${nameOfEntry(entry)}. Its items: ${labelsOf(items) || 'none'}.`,
    }
  }

  return { value: label }
}

// What a step passes to its action, checked against the state the component reports: a label
// becomes its item's value, a number stays a number, a boolean is never a string, and a
// choice the list disables is refused.
export function stepArgs(
  entry: AgentEntry,
  action: string,
  args: unknown[],
): { args: unknown[] } | { error: string } {
  const first = args[0]

  if (!CHOOSING.has(action) || first === undefined) {
    return { args }
  }

  let state: Record<string, unknown>

  try {
    state = entry.node.state?.() ?? {}
  } catch {
    return { args }
  }

  const key = fieldKey(state, action)
  const current = state[key]
  const items = entry.node.items?.() ?? []

  if (
    !items.length &&
    !entry.node.closed &&
    typeof current !== 'boolean' &&
    typeof current !== 'number'
  ) {
    return { args }
  }

  const one = (input: unknown): { value: unknown } | { error: string } => {
    if (typeof current === 'boolean') {
      return typeof input === 'boolean'
        ? { value: input }
        : { error: `${nameOfEntry(entry)} takes true or false, not ${JSON.stringify(input)}.` }
    }

    let value = input

    if (typeof value === 'string' && items.length) {
      const found = resolveLabel(entry, items, value, current)

      if ('error' in found) {
        return found
      }

      value = found.value
    }

    if (typeof value === 'string' && typeof current === 'number') {
      const number = Number(value)

      if (!value.trim() || Number.isNaN(number)) {
        return { error: `${nameOfEntry(entry)} takes a number, not ${JSON.stringify(input)}.` }
      }

      value = number
    }

    const item = items.find((candidate) => keyOfValue(candidate.value) === keyOfValue(value))

    if (item?.disabled && !held(current, value)) {
      return {
        error: `"${String(item.label ?? value)}" in ${nameOfEntry(entry)} is disabled now.`,
      }
    }

    // A closed list takes only its own items, whatever the value's type: a step that names
    // a number, an object or a value the list dropped is refused with the ones it has.
    if (!item && items.length && entry.node.closed && !held(current, value)) {
      return {
        error: `No item ${JSON.stringify(value)} in ${nameOfEntry(entry)}. Its items: ${labelsOf(items) || 'none'}.`,
      }
    }

    return { value }
  }

  if (Array.isArray(first)) {
    const values: unknown[] = []

    for (const input of first) {
      const found = one(input)

      if ('error' in found) {
        return found
      }

      values.push(found.value)
    }

    return { args: [values, ...args.slice(1)] }
  }

  const found = one(first)

  if ('error' in found) {
    return found
  }

  return {
    args: [
      Array.isArray(current) && !Array.isArray(first) ? [found.value] : found.value,
      ...args.slice(1),
    ],
  }
}
