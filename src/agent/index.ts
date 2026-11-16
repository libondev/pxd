import type { AgentEntry } from './registry.js'
import type { AgentActResult, AgentComponent, AgentStep, AgentStepResult } from './types'
import { nextTick } from 'vue'
import { withChangeDetails } from '../composables/_internal/use-change-details.js'
import { agentEntries, agentEntry, agentLabel } from './registry.js'

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

function describe(entry: AgentEntry): AgentComponent {
  const { ref, node } = entry
  const component: AgentComponent = { ref, component: node.name, actions: [] }

  const label = agentLabel(node)

  if (label) {
    component.label = label
  }

  Object.assign(component, node.state?.())
  component.actions = Object.keys(node.actions)

  return component
}

export function createAgent() {
  // A ref, or the name exactly one component answers to.
  const resolve = (ref: string) => {
    const byRef = agentEntry(ref)

    if (byRef) {
      return byRef
    }

    const needle = fold(ref)
    const named = agentEntries().filter((entry) => {
      const label = agentLabel(entry.node)

      return !!label && fold(label) === needle
    })

    return named.length === 1 ? named[0] : undefined
  }

  const snapshot = (): AgentComponent[] => agentEntries().map(describe)

  const act = async ({ steps }: { steps: AgentStep[] }): Promise<AgentActResult> => {
    const results: AgentStepResult[] = []

    for (const step of steps) {
      const entry = resolve(step.ref)

      if (!entry) {
        return {
          ok: false,
          results,
          error: { message: `No component matches "${step.ref}".`, ref: step.ref },
        }
      }

      const action = entry.node.actions[step.action]

      if (!action) {
        return {
          ok: false,
          results,
          error: {
            message: `"${entry.node.name}" has no action "${step.action}".`,
            ref: entry.ref,
          },
        }
      }

      const result = await withChangeDetails({ source: 'agent' }, () =>
        action(...(step.args ?? [])),
      )

      await nextTick()
      results.push({ ref: entry.ref, result: result ?? null })
    }

    return { ok: true, results }
  }

  const query = ({ text, within, kind }: AgentQuery = {}) => {
    const scope = within ? resolve(within)?.node.el() : undefined

    if (within && !scope) {
      return []
    }

    const needle = text ? fold(text) : undefined

    return agentEntries()
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

          return !!label && fold(label).includes(needle)
        }

        return true
      })
      .map(describe)
  }

  return { act, query, snapshot }
}
