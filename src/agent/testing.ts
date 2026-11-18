import type {
  AgentActResult,
  AgentBridge,
  AgentComponent,
  AgentSnapshotOptions,
  AgentStep,
} from './types'
import { describe, fold } from './describe.js'
import { createAgent, type AgentOptions } from './index.js'
import { findAgentTarget } from './query.js'

/**
 * What a test asks about an app's agent surface: which components it sees, and whether a step
 * runs or is refused. Every method throws when the assertion fails, so no test runner is
 * needed and none is imported.
 */
export interface AgentInspector {
  /** The bridge it reads and drives. */
  readonly agent: AgentBridge
  /** Every component the page shows an agent, as `snapshot` reports them. */
  components: (options?: AgentSnapshotOptions) => AgentComponent[]
  /** One component by its ref, its label, the text on its row or its kind, as a step would
   *  find it. Throws with the bridge's own message when it names none or several. */
  component: (selector: string, expected?: Partial<AgentComponent>) => AgentComponent
  /** Passes when no component answers to the name, throws when one does. */
  absent: (selector: string) => void
  /** Runs steps and throws unless every one of them ran. */
  run: (steps: AgentStep | AgentStep[]) => Promise<AgentActResult>
  /** Runs steps and throws unless one of them was refused, matching `expected` when given. */
  refuse: (steps: AgentStep | AgentStep[], expected?: string | RegExp) => Promise<AgentActResult>
}

const asSteps = (steps: AgentStep | AgentStep[]) => (Array.isArray(steps) ? steps : [steps])

const show = (value: unknown) => JSON.stringify(value) ?? String(value)

const same = (expected: unknown, seen: unknown) =>
  Object.is(expected, seen) || JSON.stringify(expected) === JSON.stringify(seen)

const nameOf = (component: AgentComponent) =>
  [component.component, component.ref, component.label ? `"${component.label}"` : undefined]
    .filter(Boolean)
    .join(' ')

function assertComponent(component: AgentComponent, expected: Partial<AgentComponent>) {
  const failures = Object.entries(expected)
    .filter(([key, value]) => !same(value, component[key]))
    .map(([key, value]) => `  ${key}: expected ${show(value)}, saw ${show(component[key])}`)

  if (failures.length) {
    throw new Error(`${nameOf(component)} does not match:\n${failures.join('\n')}`)
  }
}

function assertRefused(result: AgentActResult, steps: AgentStep[], expected?: string | RegExp) {
  if (result.ok) {
    throw new Error(
      `Expected ${steps.map((step) => `${step.action} on ${step.ref}`).join(', ')} to be refused; it ran.`,
    )
  }

  const message = result.error?.message ?? ''

  if (typeof expected === 'string' && !message.includes(expected)) {
    throw new Error(`Expected a refusal to mention "${expected}", saw: ${message}`)
  }

  if (expected instanceof RegExp && !expected.test(message)) {
    throw new Error(`Expected a refusal to match ${expected}, saw: ${message}`)
  }
}

/**
 * Reads a bridge the way a test does: `inspectAgent()` builds one, and `inspectAgent(agent)`
 * wraps one a test already made.
 *
 * ```ts
 * const view = inspectAgent({ allow: () => true })
 *
 * view.component('Region', { value: 'eu', actions: ['setValue', 'setOpen', 'toggle'] })
 * await view.refuse({ ref: 'Account', action: 'setValue', args: ['x'] }, 'Needs a person')
 * view.absent('checkbox')
 * ```
 */
export function inspectAgent(source?: AgentBridge | AgentOptions): AgentInspector {
  const agent: AgentBridge =
    source && typeof (source as AgentBridge).snapshot === 'function'
      ? (source as AgentBridge)
      : createAgent(source as AgentOptions | undefined)

  const components = (options?: AgentSnapshotOptions) => agent.snapshot(options)

  const component = (selector: string, expected?: Partial<AgentComponent>) => {
    const found = findAgentTarget(selector)

    if ('error' in found) {
      throw new Error(found.error)
    }

    const described = describe(found.entry)

    if (expected) {
      assertComponent(described, expected)
    }

    return described
  }

  const absent = (selector: string) => {
    const needle = fold(selector)
    const hit = components().find(
      (entry) =>
        entry.ref === selector ||
        entry.component === selector ||
        (!!entry.label && fold(String(entry.label)) === needle) ||
        (!!entry.row && fold(entry.row) === needle),
    )

    if (hit) {
      throw new Error(`Expected no component to answer to "${selector}"; ${nameOf(hit)} does.`)
    }
  }

  const run = async (steps: AgentStep | AgentStep[]) => {
    const list = asSteps(steps)
    const result = await agent.act({ steps: list })

    if (!result.ok) {
      const step = result.error?.step

      throw new Error(
        `${typeof step === 'number' ? `Step ${step + 1}: ` : ''}${result.error?.message ?? 'The run failed.'}`,
      )
    }

    return result
  }

  const refuse = async (steps: AgentStep | AgentStep[], expected?: string | RegExp) => {
    const list = asSteps(steps)
    const result = await agent.act({ steps: list })

    assertRefused(result, list, expected)

    return result
  }

  return { agent, components, component, absent, run, refuse }
}
