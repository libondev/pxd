import type {
  AgentActOptions,
  AgentActResult,
  AgentAllow,
  AgentComponent,
  AgentQuery,
} from './types'
import { createAllowGate } from './allow.js'
import { agentCallers } from './callers.js'
import { describe, MATCH_LIMIT } from './describe.js'
import { REDACTED } from './marks.js'
import { createPress } from './press.js'
import { agentShownEntries, findAgentEntries, findAgentTarget, itemsMatching } from './query.js'
import { agentLabelSafe, agentOffPage, agentSecret, agentTick } from './registry.js'
import { subscribeAgentChanges } from './report.js'
import { createRunner } from './run.js'
import { agentTools } from './tools.js'

export type * from './types'
export { agentTools } from './tools.js'
export { registerTools } from './register.js'

export interface AgentOptions {
  /** Asked before every step, marked or not. Return false to refuse it. A step the app marked
   *  `data-agent-confirm` fails without it, since a person has to make that change. */
  allow?: AgentAllow
  /** How long a step waits for `allow`, in milliseconds. Five minutes by default. */
  allowTimeout?: number
  /** How long one `act` run may take, in milliseconds. Thirty seconds by default. */
  actTimeout?: number
}

const DEFAULT_ALLOW_TIMEOUT = 5 * 60 * 1000
const DEFAULT_ACT_TIMEOUT = 30 * 1000

// The most components one `snapshot` or `query` returns, so a page with a menu on every row
// of a long table does not crowd out everything else.
const AGENT_LIMIT = 100

// The most choices one `query({ within })` returns, and how many values one `act` reports.
const ITEM_MATCH_LIMIT = 50
const VALUE_LIMIT = 100

// The entry that ends a cut list, shaped like a component so the list keeps one type.
const moreOf = (more: number): AgentComponent => ({
  ref: 'more',
  component: 'more',
  more,
  use: 'query',
  actions: [],
})

const capped = (found: AgentComponent[]) =>
  found.length > AGENT_LIMIT
    ? [...found.slice(0, AGENT_LIMIT), moreOf(found.length - AGENT_LIMIT)]
    : found

export function createAgent({
  allow,
  allowTimeout = DEFAULT_ALLOW_TIMEOUT,
  actTimeout = DEFAULT_ACT_TIMEOUT,
}: AgentOptions = {}) {
  const { refuseUnlessAllowed } = createAllowGate({ allow, allowTimeout })
  const press = createPress(refuseUnlessAllowed)
  const run = createRunner({ actTimeout, press, refuseUnlessAllowed })
  // Only what left the page while this bridge was watching is reported, so a bridge made
  // for one test does not inherit the components an earlier one removed.
  const since = agentTick()

  // One run at a time: two callers interleaving steps would fight over the same component.
  let queue: Promise<unknown> = Promise.resolve()

  // Every field's value after a run, so an agent checks its work without another snapshot.
  // A long page keeps what the steps touched first and says how many it left out.
  const valuesOf = (touched: Set<string>) => {
    const fields: { name: string; value: unknown; first: boolean }[] = []

    for (const entry of agentShownEntries()) {
      let state: Record<string, unknown>

      try {
        state = entry.node.state?.() ?? {}
      } catch {
        continue
      }

      if (state.open === true) {
        continue
      }

      const key = 'checked' in state ? 'checked' : 'value' in state ? 'value' : undefined

      if (!key) {
        continue
      }

      const secret = agentSecret(entry)

      fields.push({
        name: `${entry.ref} ${agentLabelSafe(entry.node) ?? entry.node.name}`,
        value: secret && state[key] != null && state[key] !== '' ? REDACTED : (state[key] ?? null),
        first: touched.has(entry.ref),
      })
    }

    const kept = new Set(fields.filter((field) => field.first))

    for (const field of fields) {
      if (kept.size >= VALUE_LIMIT) {
        break
      }

      kept.add(field)
    }

    const out: Record<string, unknown> = {}

    for (const field of fields) {
      if (kept.has(field)) {
        out[field.name] = field.value
      }
    }

    if (fields.length > kept.size) {
      out.more = fields.length - kept.size
    }

    return out
  }

  const finish = (result: Awaited<ReturnType<typeof run>>): AgentActResult => ({
    ok: result.ok,
    results: result.results,
    ...(result.error && { error: result.error }),
    values: valuesOf(result.touched),
    appeared: agentShownEntries()
      .filter((entry) => !result.before.has(entry.ref))
      .map(describe)
      .slice(0, AGENT_LIMIT),
  })

  const act = (options: AgentActOptions, extra?: AgentAllow) => {
    const started = queue.then(async () => finish(await run(options, extra)))

    queue = started.then(
      () => {},
      () => {},
    )

    return started
  }

  const snapshot = () => {
    const left = agentOffPage(since).map((record) => {
      const component: AgentComponent = {
        ...record.state,
        ref: record.ref,
        component: record.component,
        offPage: true,
        actions: [],
      }

      if (record.label) {
        component.label = record.label
      }

      if (record.row) {
        component.row = record.row
      }

      return component
    })

    return capped([...agentShownEntries().map(describe), ...left])
  }

  const query = (options: AgentQuery = {}) => {
    if (options.within) {
      const found = findAgentTarget(options.within)

      if ('error' in found) {
        return []
      }

      const component = describe(found.entry)
      const items = itemsMatching(found.entry, options.text)

      if (!items.length) {
        return [component]
      }

      return [
        {
          ...component,
          items: items.slice(0, ITEM_MATCH_LIMIT),
          ...(items.length > ITEM_MATCH_LIMIT && { more: items.length - ITEM_MATCH_LIMIT }),
        },
      ]
    }

    return capped(
      findAgentEntries(options).map(({ entry, matches }) => {
        const component = describe(entry)

        if (matches.length) {
          component.matchedItems = matches.slice(0, MATCH_LIMIT)
        }

        return component
      }),
    )
  }

  const agent = {
    act: (options: AgentActOptions) => act(options),
    query,
    snapshot,
    subscribe: subscribeAgentChanges,
    tools: agentTools,
  }

  // `registerTools` runs a step through the same queue as `act`, with the browser agent's
  // own check beside the app's.
  agentCallers.set(agent, (options, callerAllow, signal) =>
    act(signal ? { ...options, signal } : options, callerAllow),
  )

  return agent
}
