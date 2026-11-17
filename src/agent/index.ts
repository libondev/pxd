import type { AgentEntry } from './registry.js'
import type {
  AgentActResult,
  AgentAllowedStep,
  AgentChangeListener,
  AgentComponent,
  AgentStep,
  AgentStepResult,
} from './types'
import { nextTick } from 'vue'
import { withChangeDetails } from '../composables/_internal/use-change-details.js'
import { confirmOf, isHidden, isSecret, REDACTED } from './marks.js'
import { agentEntry, agentLabel, agentVisibleEntries } from './registry.js'
import { subscribeAgentChanges } from './report.js'

export type * from './types'

export interface AgentQuery {
  text?: string
  within?: string
  kind?: string
}

const fold = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()

const textOf = (el: Element) => (el.textContent ?? '').replace(/\s+/g, ' ').trim()

// The buttons a step can press: a closed popup renders nothing, so it can't be pressed
// until the step that opens it has rendered.
const buttonsOf = (el: Element | null | undefined) => {
  if (!el) {
    return []
  }

  const root = el.matches('button, [role="button"]') ? [el as HTMLElement] : []

  return [...root, ...el.querySelectorAll<HTMLElement>('button, [role="button"]')]
}

function describe(entry: AgentEntry): AgentComponent {
  const { ref, node } = entry
  const el = node.el()
  const component: AgentComponent = { ref, component: node.name, actions: [] }

  const label = agentLabel(node)

  if (label) {
    component.label = label
  }

  const state = node.state?.() ?? {}

  Object.assign(
    component,
    isSecret(el) ? Object.fromEntries(Object.keys(state).map((key) => [key, REDACTED])) : state,
  )

  const confirm = confirmOf(el)

  if (confirm) {
    component.confirm = confirm
  }

  const buttons = buttonsOf(node.el()).map(textOf).filter(Boolean)

  if (buttons.length) {
    component.buttons = buttons
  }

  component.actions = Object.keys(node.actions)

  return component
}

export interface AgentOptions {
  /** Asked before a step the app marked `data-agent-confirm`. Without it, such steps fail. */
  allow?: (step: AgentAllowedStep) => boolean | Promise<boolean>
  /** How long a step waits for `allow`, in milliseconds. Five minutes by default. */
  timeout?: number
}

const DEFAULT_TIMEOUT = 5 * 60 * 1000

export function createAgent({ allow, timeout = DEFAULT_TIMEOUT }: AgentOptions = {}) {
  const entries = () => agentVisibleEntries().filter((entry) => !isHidden(entry.node.el()))

  // A ref, or the name exactly one component answers to.
  const resolve = (ref: string) => {
    const byRef = agentEntry(ref)

    if (byRef) {
      return byRef
    }

    const needle = fold(ref)
    const named = entries().filter((entry) => {
      const label = agentLabel(entry.node)

      return !!label && fold(label) === needle
    })

    if (named.length === 1) {
      return named[0]
    }

    // A field nested in a wrapper answers to the same name, like a number input's own
    // text field: the name a person reads belongs to the component around it.
    const outer = named.filter((entry) => {
      const own = entry.node.el()

      return !!own && named.every((other) => other === entry || own.contains(other.node.el()!))
    })

    return outer.length === 1 ? outer[0] : undefined
  }

  const snapshot = (): AgentComponent[] => entries().map(describe)

  // A step the app marked has to be allowed before anything happens.
  const refuseUnlessAllowed = async (entry: AgentEntry, action: string, el?: Element | null) => {
    const confirm = confirmOf(el ?? entry.node.el())

    if (!confirm) {
      return
    }

    const question: AgentAllowedStep = {
      ref: entry.ref,
      component: entry.node.name,
      action,
      confirm,
    }

    const label = agentLabel(entry.node)

    if (label) {
      question.label = label
    }

    if (await ask(question)) {
      return
    }

    return `Needs a person: ${confirm}`
  }

  const ask = async (question: AgentAllowedStep) => {
    if (!allow) {
      return false
    }

    const answer = Promise.resolve(allow(question))
    const guarded = answer.then((allowed) => !!allowed)
    let timer: ReturnType<typeof setTimeout> | undefined

    const expired = new Promise<boolean>((resolve) => {
      timer = setTimeout(() => resolve(false), timeout)
    })

    try {
      return await Promise.race([guarded, expired])
    } finally {
      clearTimeout(timer)
    }
  }

  // Clicks the button a step names. A closed popup renders no buttons, so a component that
  // declares `setOpen` is opened first and read again.
  const press = async (entry: AgentEntry, text?: unknown) => {
    const read = () =>
      buttonsOf(entry.node.el())
        .map((el) => ({ el, text: textOf(el) }))
        .filter((button) => button.text)

    let buttons = read()

    if (!buttons.length && entry.node.actions.setOpen) {
      await withChangeDetails({ source: 'agent' }, () => entry.node.actions.setOpen(true))
      await nextTick()
      buttons = read()
    }

    if (!buttons.length) {
      return `"${entry.node.name}" has no buttons to press.`
    }

    if (typeof text !== 'string' || !text) {
      if (buttons.length === 1) {
        const refused = await refuseUnlessAllowed(entry, 'press', buttons[0].el)

        if (refused) {
          return refused
        }

        withChangeDetails({ source: 'agent' }, () => buttons[0].el.click())
        await nextTick()

        return
      }

      return `"${entry.node.name}" has ${buttons.length} buttons; name one of: ${buttons.map((button) => button.text).join(', ')}.`
    }

    const wanted = fold(text)
    const exact = buttons.filter((button) => fold(button.text) === wanted)
    const near = exact.length
      ? exact
      : buttons.filter((button) => fold(button.text).includes(wanted))

    if (near.length > 1) {
      return `"${entry.node.name}" has ${near.length} buttons matching "${text}"; name one of: ${near.map((button) => button.text).join(', ')}.`
    }

    if (!near.length) {
      return `"${entry.node.name}" has no button matching "${text}"; it has: ${buttons.map((button) => button.text).join(', ')}.`
    }

    const refused = await refuseUnlessAllowed(entry, 'press', near[0].el)

    if (refused) {
      return refused
    }

    withChangeDetails({ source: 'agent' }, () => near[0].el.click())
    await nextTick()
  }

  const act = async ({ steps }: { steps: AgentStep[] }): Promise<AgentActResult> => {
    const results: AgentStepResult[] = []

    for (const step of steps) {
      const entry = resolve(step.ref)

      if (!entry) {
        return {
          ok: false,
          results,
          error: { message: `No component matches "${step.ref}".`, ref: step.ref },
        }
      }

      if (step.action === 'press') {
        const error = await press(entry, step.args?.[0])

        if (error) {
          return { ok: false, results, error: { message: error, ref: entry.ref } }
        }

        results.push({ ref: entry.ref, result: null })

        continue
      }

      const refused = await refuseUnlessAllowed(entry, step.action)

      if (refused) {
        return { ok: false, results, error: { message: refused, ref: entry.ref } }
      }

      const action = entry.node.actions[step.action]

      if (!action) {
        return {
          ok: false,
          results,
          error: {
            message: `"${entry.node.name}" has no action "${step.action}".`,
            ref: entry.ref,
          },
        }
      }

      const result = await withChangeDetails({ source: 'agent' }, () =>
        action(...(step.args ?? [])),
      )

      await nextTick()
      results.push({ ref: entry.ref, result: result ?? null })
    }

    return { ok: true, results }
  }

  const query = ({ text, within, kind }: AgentQuery = {}) => {
    const scope = within ? resolve(within)?.node.el() : undefined

    if (within && !scope) {
      return []
    }

    const needle = text ? fold(text) : undefined

    return entries()
      .filter((entry) => {
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

          return !!label && fold(label).includes(needle)
        }

        return true
      })
      .map(describe)
  }

  const subscribe = (listener: AgentChangeListener) => subscribeAgentChanges(listener)

  return { act, query, snapshot, subscribe }
}
