import type { AgentEntry } from './registry.js'
import type { AgentAllow, AgentAllowedStep } from './types'
import { safeItems } from './describe.js'
import { itemKey } from './items.js'
import { confirmOf, confirmOn } from './marks.js'
import { agentElement, agentLabelSafe, agentMarkElement } from './registry.js'
import { CHOOSING } from './values.js'

/** One step, as the gate sees it: its action, its arguments, where its marks live. */
export interface StepGate {
  action: string
  args: unknown[]
  /** The elements this step touches besides the component itself, like the choice it names
   *  or the button it presses. Every mark among them is read. */
  els?: (Element | null | undefined)[]
  /** The caller's own check, added beside the bridge's when a browser agent asks. */
  allow?: AgentAllow
  signal?: AbortSignal
}

// The sentences the choices a step names carry in their own data, which is where a list that
// has not rendered them keeps them: a closed menu, a row past the window.
function confirmOfItems(entry: AgentEntry, gate: StepGate) {
  const first = gate.args[0]

  if (!CHOOSING.has(gate.action) || first === undefined) {
    return []
  }

  const items = safeItems(entry)

  return (Array.isArray(first) ? first : [first])
    .map((value) => items.find((item) => itemKey(item.value) === itemKey(value))?.confirm)
    .filter((text): text is string => !!text)
}

// Every mark the step touches, said once each: a choice marked the same as the component
// around it is one sentence, not two.
function confirmFor(entry: AgentEntry, gate: StepGate) {
  const texts = [
    confirmOf(agentMarkElement(entry)),
    ...(gate.els ?? []).map(confirmOn),
    ...confirmOfItems(entry, gate),
  ].filter((text): text is string => !!text)

  return [...new Set(texts)].join('; ')
}

export type RefuseUnlessAllowed = (entry: AgentEntry, gate: StepGate) => Promise<string | undefined>

interface AllowGateOptions {
  allow?: AgentAllow
  /** How long a step waits for the answer before it counts as refused. */
  allowTimeout: number
}

/** Which gate turned a step down: the app's own `allow`, or the one `registerTools` was given. */
type Refusal = 'app' | 'tools' | 'none'

interface Check {
  allow: AgentAllow
  by: Exclude<Refusal, 'none'>
}

// Every step is asked about, marked or not, so an app can refuse one for its own reasons.
// A step the app marked with `data-agent-confirm` fails without an `allow`: a person has to
// make that change, and the bridge never guesses at their answer.
export function createAllowGate({ allow, allowTimeout }: AllowGateOptions) {
  const ask = async (
    base: Omit<AgentAllowedStep, 'signal'>,
    checks: Check[],
    outer?: AbortSignal,
  ): Promise<true | Refusal> => {
    const controller = new AbortController()
    const question: AgentAllowedStep = { ...base, signal: controller.signal }
    let timer: ReturnType<typeof setTimeout> | undefined
    let onAbort: (() => void) | undefined

    const late = new Promise<Refusal>((resolve) => {
      timer = setTimeout(() => resolve('none'), allowTimeout)
    })
    const stopped = new Promise<Refusal>((resolve) => {
      if (outer?.aborted) {
        resolve('none')

        return
      }

      onAbort = () => resolve('none')
      outer?.addEventListener('abort', onAbort, { once: true })
    })

    try {
      const guarded = (async (): Promise<true | Refusal> => {
        for (const check of checks) {
          if (controller.signal.aborted) {
            return 'none'
          }

          if (!(await check.allow(question))) {
            return check.by
          }
        }

        return true
      })()

      return await Promise.race([guarded, late, stopped])
    } finally {
      clearTimeout(timer)

      if (onAbort) {
        outer?.removeEventListener('abort', onAbort)
      }

      controller.abort()
    }
  }

  const refuseUnlessAllowed: RefuseUnlessAllowed = async (entry, gate) => {
    const confirm = confirmFor(entry, gate)
    const checks: Check[] = []

    if (allow) {
      checks.push({ allow, by: 'app' })
    }

    if (gate.allow) {
      checks.push({ allow: gate.allow, by: 'tools' })
    }

    if (!checks.length) {
      return confirm ? `Needs a person: ${confirm}` : undefined
    }

    const question: Omit<AgentAllowedStep, 'signal'> = {
      ref: entry.ref,
      component: entry.node.name,
      action: gate.action,
      args: gate.args,
      els: [agentElement(entry) ?? undefined, ...(gate.els ?? []).map((el) => el ?? undefined)],
    }
    const label = agentLabelSafe(entry.node)

    if (label) {
      question.label = label
    }

    if (confirm) {
      question.confirm = confirm
    }

    const refused = await ask(question, checks, gate.signal)

    if (refused === true) {
      return
    }

    const target = `${gate.action} on ${entry.ref}`

    if (refused === 'none') {
      return `Nobody answered in time for ${target}.`
    }

    const by = refused === 'tools' ? "registerTools' allow" : 'the app'

    return `Refused ${target} by ${by}${confirm ? `: ${confirm}` : '.'}`
  }

  return { refuseUnlessAllowed }
}
