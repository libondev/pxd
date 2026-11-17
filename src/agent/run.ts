import type { RefuseUnlessAllowed } from './allow.js'
import type { PressOutcome } from './press.js'
import type { AgentEntry } from './registry.js'
import type { AgentActOptions, AgentAllow, AgentStepChange, AgentStepResult } from './types'
import type { AgentFieldState } from './values.js'
import { nextTick } from 'vue'
import { withChangeDetails } from '../composables/_internal/use-change-details.js'
import { agentDisabled, messageOf } from './describe.js'
import { REDACTED } from './marks.js'
import { agentShownEntries, findAgentTarget } from './query.js'
import { agentLabelSafe, agentSecret } from './registry.js'
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
  /** The components whose state changed during the run, on their own or as a side effect. */
  changed: Set<string>
  /** The components that were on the page when the run began. */
  before: Set<string>
  /** What the page showed after the last step, for the run's own report. */
  after: StepSnapshot
}

interface RunnerDeps {
  actTimeout: number
  press: (entry: AgentEntry, text?: unknown, signal?: AbortSignal) => Promise<PressOutcome>
  refuseUnlessAllowed: RefuseUnlessAllowed
}

// What every component showed before a step, so the step can report what it changed and
// what it took off the page.
interface StepSnapshot {
  refs: Set<string>
  states: Map<string, AgentFieldState>
}

const differs = (was: unknown, now: unknown) =>
  !Object.is(was, now) && JSON.stringify(was) !== JSON.stringify(now)

function captureStep(): StepSnapshot {
  const refs = new Set<string>()
  const states: StepSnapshot['states'] = new Map()

  for (const entry of agentShownEntries()) {
    refs.add(entry.ref)

    try {
      states.set(entry.ref, {
        component: entry.node.name,
        label: agentLabelSafe(entry.node),
        secret: agentSecret(entry),
        state: entry.node.state?.() ?? {},
      })
    } catch {
      states.set(entry.ref, {
        component: entry.node.name,
        label: agentLabelSafe(entry.node),
        secret: agentSecret(entry),
        state: {},
      })
    }
  }

  return { refs, states }
}

function diffStep(before: StepSnapshot, after: StepSnapshot) {
  const changes: AgentStepChange[] = []

  for (const [ref, now] of after.states) {
    const was = before.states.get(ref)

    if (!was) {
      continue
    }

    for (const key of new Set([...Object.keys(was.state), ...Object.keys(now.state)])) {
      if (!differs(was.state[key], now.state[key])) {
        continue
      }

      changes.push({
        ref,
        component: now.component,
        ...(now.label && { label: now.label }),
        key,
        value: now.secret ? REDACTED : now.state[key],
      })
    }
  }

  const left = [...before.refs].filter((ref) => !after.refs.has(ref))
  const gone = left.map((ref) => {
    const was = before.states.get(ref)

    return [ref, was?.label ?? was?.component].filter(Boolean).join(' ')
  })

  return { changes, gone: gone.length > 10 ? left : gone }
}

export function createRunner({ actTimeout, press, refuseUnlessAllowed }: RunnerDeps) {
  return async (
    { steps, timeout: budget = actTimeout, signal }: AgentActOptions,
    allow?: AgentAllow,
  ): Promise<AgentRunResult> => {
    const deadline = Date.now() + budget
    const results: AgentStepResult[] = []
    const touched = new Set<string>()
    const changed = new Set<string>()
    // One capture to begin, then each step's own: what a step leaves behind is what the
    // next one starts from, so a run of steps reads the page half as often.
    let current = captureStep()
    const before = new Set(current.refs)
    let at: { index: number; ref?: string } = { index: 0 }

    const fail = (message: string): AgentRunResult => ({
      ok: false,
      results,
      touched,
      changed,
      before,
      after: current,
      error: { message, ...(at.ref ? { ref: at.ref } : {}), step: at.index },
    })

    try {
      for (const [index, step] of steps.entries()) {
        at = { index, ref: step.ref }

        if (signal?.aborted || Date.now() >= deadline) {
          throw new Stop(signal?.aborted ? 'canceled' : 'timeout')
        }

        const found = findAgentTarget(step.ref, step.action, step.args?.[0])

        if ('error' in found) {
          return fail(found.error)
        }

        const entry = found.entry

        at = { index, ref: entry.ref }

        if (agentDisabled(entry)) {
          return fail(`${entry.node.name} ${entry.ref} is disabled now.`)
        }

        const staged = stepArgs(entry, step.action, step.args ?? [])

        if ('error' in staged) {
          return fail(staged.error)
        }

        if (step.action === 'press') {
          const outcome = await settle(press(entry, staged.args[0], signal), deadline, signal)

          if ('error' in outcome) {
            return fail(outcome.error)
          }

          await settle(nextTick(), deadline, signal)
          touched.add(entry.ref)

          const after = captureStep()
          const { changes, gone } = diffStep(current, after)

          current = after
          changes.forEach((change) => changed.add(change.ref))

          results.push({
            ref: entry.ref,
            result: outcome.pressed,
            ...(changes.length && { changes }),
            ...(gone.length && { gone }),
          })

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
          return fail(refused)
        }

        const action = entry.node.actions[step.action]

        if (!action) {
          return fail(`"${entry.node.name}" has no action "${step.action}".`)
        }

        // The person who answered `allow` may have disabled it while deciding.
        if (agentDisabled(entry)) {
          return fail(`${entry.node.name} ${entry.ref} is disabled now.`)
        }

        const result = await settle(
          withChangeDetails({ source: 'agent' }, () => action(...staged.args)),
          deadline,
          signal,
        )
        const settled = await settle(settlePending(entry), deadline, signal)

        if (settled.error != null) {
          return fail(`${step.action} on ${entry.ref} failed: ${messageOf(settled.error)}`)
        }

        await settle(nextTick(), deadline, signal)
        touched.add(entry.ref)

        const after = captureStep()
        const { changes, gone } = diffStep(current, after)

        current = after
        changes.forEach((change) => changed.add(change.ref))

        results.push({
          ref: entry.ref,
          result: settled.pending ? `${step.action} is still running.` : (result ?? null),
          ...(changes.length && { changes }),
          ...(gone.length && { gone }),
        })
      }
    } catch (error) {
      // A component's own action can throw: that is the step failing, not the caller's
      // promise, and the message is what a model needs to correct itself.
      return fail(
        error instanceof Stop
          ? error.kind === 'canceled'
            ? 'Canceled.'
            : `Timed out after ${budget}ms.`
          : messageOf(error),
      )
    }

    return { ok: true, results, touched, changed, before, after: current }
  }
}
