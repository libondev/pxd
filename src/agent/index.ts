import type { AgentEntry } from './registry.js'
import type {
  AgentActOptions,
  AgentActResult,
  AgentAllowedStep,
  AgentChangeListener,
  AgentComponent,
  AgentStepResult,
} from './types'
import { nextTick } from 'vue'
import { withChangeDetails } from '../composables/_internal/use-change-details.js'
import { accessibleName } from './label.js'
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

// What a button is called: its accessible name first, so an icon-only button that carries
// aria-label is still pressable by the word a person hears.
const nameOf = (el: Element) => accessibleName(el) ?? textOf(el)

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

  const buttons = buttonsOf(node.el()).map(nameOf).filter(Boolean)

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

export interface AgentOptions {
  /** Asked before a step the app marked `data-agent-confirm`. Without it, such steps fail. */
  allow?: (step: AgentAllowedStep) => boolean | Promise<boolean>
  /** How long a marked step waits for `allow`, in milliseconds. Five minutes by default. */
  allowTimeout?: number
  /** How long one `act` run may take, in milliseconds. Thirty seconds by default. */
  actTimeout?: number
}

const DEFAULT_ALLOW_TIMEOUT = 5 * 60 * 1000
const DEFAULT_ACT_TIMEOUT = 30 * 1000
// A snapshot has to stay readable to a model: a list of ten thousand rows would crowd out
// everything else, so items stop here and `itemCount` says how many there really are.
const ITEM_LIMIT = 100

export function createAgent({
  allow,
  allowTimeout = DEFAULT_ALLOW_TIMEOUT,
  actTimeout = DEFAULT_ACT_TIMEOUT,
}: AgentOptions = {}) {
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
      timer = setTimeout(() => resolve(false), allowTimeout)
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
        .map((el) => ({ el, text: nameOf(el) }))
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

  // A step that outlasts the run's budget, or one the caller cancels, ends the run where it is.
  class Stop extends Error {
    constructor(readonly kind: 'canceled' | 'timeout') {
      super(kind)
    }
  }

  const settle = <T>(work: Promise<T> | T, budget: number, signal?: AbortSignal) =>
    new Promise<T>((resolve, reject) => {
      const remaining = budget - Date.now()

      if (signal?.aborted) {
        reject(new Stop('canceled'))

        return
      }

      if (remaining <= 0) {
        reject(new Stop('timeout'))

        return
      }

      const done = () => {
        clearTimeout(timer)
        signal?.removeEventListener('abort', onAbort)
      }
      const onAbort = () => {
        done()
        reject(new Stop('canceled'))
      }
      const timer = setTimeout(() => {
        done()
        reject(new Stop('timeout'))
      }, remaining)

      signal?.addEventListener('abort', onAbort, { once: true })

      // A step that finishes after the race was lost changes the page anyway; nothing here
      // can undo that, so the promise is handled and its result dropped.
      void (async () => {
        try {
          resolve(await work)
        } catch (error) {
          reject(error)
        } finally {
          done()
        }
      })()
    })

  const runSteps = async ({
    steps,
    timeout: budget = actTimeout,
    signal,
  }: AgentActOptions): Promise<AgentActResult> => {
    const deadline = Date.now() + budget
    const results: AgentStepResult[] = []
    let at: { index: number; ref?: string } = { index: 0 }

    try {
      for (const [index, step] of steps.entries()) {
        at = { index }

        if (signal?.aborted || Date.now() >= deadline) {
          throw new Stop(signal?.aborted ? 'canceled' : 'timeout')
        }

        const entry = resolve(step.ref)

        if (!entry) {
          return {
            ok: false,
            results,
            error: { message: `No component matches "${step.ref}".`, ref: step.ref, step: index },
          }
        }

        at = { index, ref: entry.ref }

        if (step.action === 'press') {
          const error = await settle(press(entry, step.args?.[0]), deadline, signal)

          if (error) {
            return { ok: false, results, error: { message: error, ref: entry.ref, step: index } }
          }

          await settle(nextTick(), deadline, signal)
          results.push({ ref: entry.ref, result: null })

          continue
        }

        const refused = await settle(refuseUnlessAllowed(entry, step.action), deadline, signal)

        if (refused) {
          return { ok: false, results, error: { message: refused, ref: entry.ref, step: index } }
        }

        const action = entry.node.actions[step.action]

        if (!action) {
          return {
            ok: false,
            results,
            error: {
              message: `"${entry.node.name}" has no action "${step.action}".`,
              ref: entry.ref,
              step: index,
            },
          }
        }

        const result = await settle(
          withChangeDetails({ source: 'agent' }, () => action(...(step.args ?? []))),
          deadline,
          signal,
        )

        await settle(nextTick(), deadline, signal)
        results.push({ ref: entry.ref, result: result ?? null })
      }
    } catch (error) {
      if (!(error instanceof Stop)) {
        throw error
      }

      return {
        ok: false,
        results,
        error: {
          message: error.kind === 'canceled' ? 'Canceled.' : `Timed out after ${budget}ms.`,
          ref: at.ref,
          step: at.index,
        },
      }
    }

    return { ok: true, results }
  }

  // One run at a time: two callers interleaving steps would fight over the same component.
  let queue: Promise<unknown> = Promise.resolve()

  const act = (options: AgentActOptions) => {
    const run = queue.then(() => runSteps(options))

    queue = run.then(
      () => {},
      () => {},
    )

    return run
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

          if (label && fold(label).includes(needle)) {
            return true
          }

          // A choice inside it matches too, so "the component holding Atlas" is findable
          // even when the label says something else.
          return (entry.node.items?.() ?? []).some(
            (item) => item.label !== undefined && fold(String(item.label)).includes(needle),
          )
        }

        return true
      })
      .map(describe)
  }

  const subscribe = (listener: AgentChangeListener) => subscribeAgentChanges(listener)

  return { act, query, snapshot, subscribe }
}
