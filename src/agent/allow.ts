import type { AgentEntry } from './registry.js'
import type { AgentAllow, AgentAllowedStep } from './types'
import { confirmOf } from './marks.js'
import { agentLabelSafe, agentMarkElement } from './registry.js'

/** One step, as the gate sees it: its action, its arguments, where its marks live. */
export interface StepGate {
  action: string
  args: unknown[]
  /** Where the marks for this step are read, when it is not the component's own element. */
  el?: Element | null
  /** The caller's own check, added beside the bridge's when a browser agent asks. */
  allow?: AgentAllow
  signal?: AbortSignal
}

export type RefuseUnlessAllowed = (entry: AgentEntry, gate: StepGate) => Promise<string | undefined>

interface AllowGateOptions {
  allow?: AgentAllow
  /** How long a step waits for the answer before it counts as refused. */
  allowTimeout: number
}

// Every step is asked about, marked or not, so an app can refuse one for its own reasons.
// A step the app marked with `data-agent-confirm` fails without an `allow`: a person has to
// make that change, and the bridge never guesses at their answer.
export function createAllowGate({ allow, allowTimeout }: AllowGateOptions) {
  const ask = async (
    base: Omit<AgentAllowedStep, 'signal'>,
    checks: AgentAllow[],
    outer?: AbortSignal,
  ) => {
    const controller = new AbortController()
    const question: AgentAllowedStep = { ...base, signal: controller.signal }
    let timer: ReturnType<typeof setTimeout> | undefined
    let onAbort: (() => void) | undefined

    const late = new Promise<boolean>((resolve) => {
      timer = setTimeout(() => resolve(false), allowTimeout)
    })
    const stopped = new Promise<boolean>((resolve) => {
      if (outer?.aborted) {
        resolve(false)

        return
      }

      onAbort = () => resolve(false)
      outer?.addEventListener('abort', onAbort, { once: true })
    })

    try {
      const guarded = (async () => {
        for (const check of checks) {
          if (controller.signal.aborted) {
            return false
          }

          if (!(await check(question))) {
            return false
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
    const confirm = confirmOf(gate.el ?? agentMarkElement(entry))
    const checks = [allow, gate.allow].filter((check): check is AgentAllow => !!check)

    if (!checks.length) {
      return confirm ? `Needs a person: ${confirm}` : undefined
    }

    const question: Omit<AgentAllowedStep, 'signal'> = {
      ref: entry.ref,
      component: entry.node.name,
      action: gate.action,
      args: gate.args,
    }
    const label = agentLabelSafe(entry.node)

    if (label) {
      question.label = label
    }

    if (confirm) {
      question.confirm = confirm
    }

    if (await ask(question, checks, gate.signal)) {
      return
    }

    return confirm
      ? `Refused ${gate.action} on ${entry.ref}: ${confirm}`
      : `Refused ${gate.action} on ${entry.ref}.`
  }

  return { refuseUnlessAllowed }
}
