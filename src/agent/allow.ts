import type { AgentEntry } from './registry.js'
import type { AgentAllowedStep } from './types'
import { confirmOf } from './marks.js'
import { agentLabelSafe, agentMarkElement } from './registry.js'

export type RefuseUnlessAllowed = (
  entry: AgentEntry,
  action: string,
  el?: Element | null,
) => Promise<string | undefined>

interface AllowGateOptions {
  allow?: (step: AgentAllowedStep) => boolean | Promise<boolean>
  /** How long a step waits for the answer before it counts as refused. */
  allowTimeout: number
}

// A step the app marked has to be allowed before anything happens. Without `allow`, a marked
// step is refused rather than guessed at.
export function createAllowGate({ allow, allowTimeout }: AllowGateOptions) {
  const ask = async (question: AgentAllowedStep) => {
    if (!allow) {
      return false
    }

    const guarded = Promise.resolve(allow(question)).then((allowed) => !!allowed)
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

  const refuseUnlessAllowed: RefuseUnlessAllowed = async (entry, action, el) => {
    const confirm = confirmOf(el ?? agentMarkElement(entry))

    if (!confirm) {
      return
    }

    const question: AgentAllowedStep = {
      ref: entry.ref,
      component: entry.node.name,
      action,
      confirm,
    }

    const label = agentLabelSafe(entry.node)

    if (label) {
      question.label = label
    }

    if (await ask(question)) {
      return
    }

    return `Needs a person: ${confirm}`
  }

  return { refuseUnlessAllowed }
}
