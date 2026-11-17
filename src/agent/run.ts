import type { RefuseUnlessAllowed } from './allow.js'
import type { PressOutcome } from './press.js'
import type { AgentEntry } from './registry.js'
import type { AgentActOptions, AgentAllow, AgentStepResult } from './types'
import { nextTick } from 'vue'
import { withChangeDetails } from '../composables/_internal/use-change-details.js'
import { agentDisabled, messageOf } from './describe.js'
import { agentShownEntries, findAgentTarget } from './query.js'
import { stepArgs } from './values.js'

// A step that outlasts the run's budget, or one the caller cancels, ends the run where it is.
class Stop extends Error {
  constructor(readonly kind: 'canceled' | 'timeout') {
    super(kind)
  }
}

// How long a step waits for the component's own work, like a save, before reporting it as
// still running.
const PENDING_TIMEOUT = 15_000
const PENDING_POLL = 50

const settle = <T>(work: Promise<T> | T, deadline: number, signal?: AbortSignal) =>
  new Promise<T>((resolve, reject) => {
    const remaining = deadline - Date.now()

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

// Whether the component's own work is still running, and why it failed if it did.
async function settlePending(entry: AgentEntry) {
  const pending = () => {
    try {
      return entry.node.pending?.() === true
    } catch {
      return false
    }
  }

  let waited = 0

  while (pending() && waited < PENDING_TIMEOUT) {
    await new Promise((resolve) => setTimeout(resolve, PENDING_POLL))
    waited += PENDING_POLL
  }

  try {
    return { pending: pending(), error: entry.node.error?.() }
  } catch (error) {
    return { pending: pending(), error }
  }
}

export interface AgentRunResult {
  ok: boolean
  results: AgentStepResult[]
  error?: { message: string; ref?: string; step?: number }
  /** The components the run acted on. */
  touched: Set<string>
  /** The components that were on the page when the run began. */
  before: Set<string>
}

interface RunnerDeps {
  actTimeout: number
  press: (entry: AgentEntry, text?: unknown, signal?: AbortSignal) => Promise<PressOutcome>
  refuseUnlessAllowed: RefuseUnlessAllowed
}

export function createRunner({ actTimeout, press, refuseUnlessAllowed }: RunnerDeps) {
  return async (
    { steps, timeout: budget = actTimeout, signal }: AgentActOptions,
    allow?: AgentAllow,
  ): Promise<AgentRunResult> => {
    const deadline = Date.now() + budget
    const results: AgentStepResult[] = []
    const touched = new Set<string>()
    const before = new Set(agentShownEntries().map((entry) => entry.ref))
    let at: { index: number; ref?: string } = { index: 0 }

    try {
      for (const [index, step] of steps.entries()) {
        at = { index }

        if (signal?.aborted || Date.now() >= deadline) {
          throw new Stop(signal?.aborted ? 'canceled' : 'timeout')
        }

        const found = findAgentTarget(step.ref, step.action, step.args?.[0])

        if ('error' in found) {
          return {
            ok: false,
            results,
            touched,
            before,
            error: { message: found.error, ref: step.ref, step: index },
          }
        }

        const entry = found.entry

        at = { index, ref: entry.ref }

        if (agentDisabled(entry)) {
          return {
            ok: false,
            results,
            touched,
            before,
            error: {
              message: `${entry.node.name} ${entry.ref} is disabled now.`,
              ref: entry.ref,
              step: index,
            },
          }
        }

        const staged = stepArgs(entry, step.action, step.args ?? [])

        if ('error' in staged) {
          return {
            ok: false,
            results,
            touched,
            before,
            error: { message: staged.error, ref: entry.ref, step: index },
          }
        }

        if (step.action === 'press') {
          const outcome = await settle(press(entry, staged.args[0], signal), deadline, signal)

          if ('error' in outcome) {
            return {
              ok: false,
              results,
              touched,
              before,
              error: { message: outcome.error, ref: entry.ref, step: index },
            }
          }

          await settle(nextTick(), deadline, signal)
          touched.add(entry.ref)
          results.push({ ref: entry.ref, result: outcome.pressed })

          continue
        }

        const refused = await settle(
          refuseUnlessAllowed(entry, {
            action: step.action,
            args: staged.args,
            allow,
            signal,
          }),
          deadline,
          signal,
        )

        if (refused) {
          return {
            ok: false,
            results,
            touched,
            before,
            error: { message: refused, ref: entry.ref, step: index },
          }
        }

        const action = entry.node.actions[step.action]

        if (!action) {
          return {
            ok: false,
            results,
            touched,
            before,
            error: {
              message: `"${entry.node.name}" has no action "${step.action}".`,
              ref: entry.ref,
              step: index,
            },
          }
        }

        // The person who answered `allow` may have disabled it while deciding.
        if (agentDisabled(entry)) {
          return {
            ok: false,
            results,
            touched,
            before,
            error: {
              message: `${entry.node.name} ${entry.ref} is disabled now.`,
              ref: entry.ref,
              step: index,
            },
          }
        }

        const result = await settle(
          withChangeDetails({ source: 'agent' }, () => action(...staged.args)),
          deadline,
          signal,
        )
        const settled = await settle(settlePending(entry), deadline, signal)

        if (settled.error != null) {
          return {
            ok: false,
            results,
            touched,
            before,
            error: {
              message: `${step.action} on ${entry.ref} failed: ${messageOf(settled.error)}`,
              ref: entry.ref,
              step: index,
            },
          }
        }

        await settle(nextTick(), deadline, signal)
        touched.add(entry.ref)
        results.push({
          ref: entry.ref,
          result: settled.pending ? `${step.action} is still running.` : (result ?? null),
        })
      }
    } catch (error) {
      // A component's own action can throw: that is the step failing, not the caller's
      // promise, and the message is what a model needs to correct itself.
      return {
        ok: false,
        results,
        touched,
        before,
        error: {
          message:
            error instanceof Stop
              ? error.kind === 'canceled'
                ? 'Canceled.'
                : `Timed out after ${budget}ms.`
              : messageOf(error),
          ref: at.ref,
          step: at.index,
        },
      }
    }

    return { ok: true, results, touched, before }
  }
}
