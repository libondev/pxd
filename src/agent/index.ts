import type { AgentActOptions, AgentAllowedStep, AgentQuery } from './types'
import { createAllowGate } from './allow.js'
import { describe } from './describe.js'
import { createPress } from './press.js'
import { agentShownEntries, findAgentEntries, resolveAgentEntry } from './query.js'
import { subscribeAgentChanges } from './report.js'
import { createRunner } from './run.js'
import { agentTools } from './tools.js'

export type * from './types'
export { agentTools } from './tools.js'

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

export function createAgent({
  allow,
  allowTimeout = DEFAULT_ALLOW_TIMEOUT,
  actTimeout = DEFAULT_ACT_TIMEOUT,
}: AgentOptions = {}) {
  const { refuseUnlessAllowed } = createAllowGate({ allow, allowTimeout })
  const press = createPress(refuseUnlessAllowed)
  const run = createRunner({ actTimeout, press, refuseUnlessAllowed, resolve: resolveAgentEntry })

  // One run at a time: two callers interleaving steps would fight over the same component.
  let queue: Promise<unknown> = Promise.resolve()

  const act = (options: AgentActOptions) => {
    const started = queue.then(() => run(options))

    queue = started.then(
      () => {},
      () => {},
    )

    return started
  }

  return {
    act,
    query: (options?: AgentQuery) => findAgentEntries(options).map(describe),
    snapshot: () => agentShownEntries().map(describe),
    subscribe: subscribeAgentChanges,
    tools: agentTools,
  }
}
