import type { RefuseUnlessAllowed } from './allow.js'
import type { PressOutcome } from './press.js'
import type { AgentEntry } from './registry.js'
import type { AgentActOptions, AgentActResult, AgentStepResult } from './types'
import { nextTick } from 'vue'
import { withChangeDetails } from '../composables/_internal/use-change-details.js'

// A step that outlasts the run's budget, or one the caller cancels, ends the run where it is.
class Stop extends Error {
  constructor(readonly kind: 'canceled' | 'timeout') {
    super(kind)
  }
}

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

interface RunnerDeps {
  actTimeout: number
  resolve: (ref: string) => AgentEntry | undefined
  press: (entry: AgentEntry, text?: unknown) => Promise<PressOutcome>
  refuseUnlessAllowed: RefuseUnlessAllowed
}

export function createRunner({ actTimeout, resolve, press, refuseUnlessAllowed }: RunnerDeps) {
  return async ({
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
          const outcome = await settle(press(entry, step.args?.[0]), deadline, signal)

          if ('error' in outcome) {
            return {
              ok: false,
              results,
              error: { message: outcome.error, ref: entry.ref, step: index },
            }
          }

          await settle(nextTick(), deadline, signal)
          results.push({ ref: entry.ref, result: outcome.pressed })

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
}
