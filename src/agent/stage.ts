import type { AgentBridge } from './types'
import { REDACTED } from './marks.js'

/** One value to put on a control: its ref or label, the key, and the value. */
export interface StagedChange {
  ref: string
  /** Which value to set, `value` by default. */
  key?: string
  value: unknown
}

/** A change that went on, with the value it replaced. */
export interface StagedChangeResult {
  ref: string
  key: string
  before: unknown
  value: unknown
}

export type SetterOf = (key: string) => string

/** The action that sets a state key: `value` is `setValue`, `checked` is `setChecked`. */
export const setterOf: SetterOf = (key) => `set${key[0].toUpperCase()}${key.slice(1)}`

/**
 * Puts values on the page's controls through the bridge, and returns how to take them back:
 * a suggestion shown on the real control while a person looks at it, a preview of a preset.
 * A change whose control takes no such action is skipped, and `revert` restores only the
 * ones that ran, in reverse order, resolving with the ones it could not put back — a secret
 * field's, whose value before reads `"[redacted]"`.
 */
export async function stageChanges(
  agent: Pick<AgentBridge, 'snapshot' | 'act'>,
  changes: readonly StagedChange[],
) {
  const onPage = agent.snapshot().filter((entry) => !entry.offPage && entry.component !== 'more')
  const applied: StagedChangeResult[] = []

  for (const change of changes) {
    const key = change.key ?? 'value'
    const action = setterOf(key)
    const entry =
      onPage.find((entry) => entry.ref === change.ref) ??
      onPage.find((entry) => entry.label === change.ref)

    if (!entry || !(key in entry) || !entry.actions.includes(action)) {
      continue
    }

    const before = entry[key]
    const result = await agent.act({ steps: [{ ref: entry.ref, action, args: [change.value] }] })

    if (result.ok) {
      applied.push({ ref: entry.ref, key, before, value: change.value })
    }
  }

  let reverted = false

  return {
    /** The changes that went on, each with the value it replaced. */
    applied,
    /** Puts back what each control had, and resolves with the ones it could not. Runs once. */
    async revert() {
      if (reverted) {
        return []
      }

      reverted = true

      const failed: typeof applied = []

      for (const change of [...applied].reverse()) {
        // A secret field's value before is hidden: "[redacted]" must not land in it.
        const result =
          change.before === REDACTED
            ? undefined
            : await agent.act({
                steps: [{ ref: change.ref, action: setterOf(change.key), args: [change.before] }],
              })

        if (!result?.ok) {
          failed.push(change)
        }
      }

      return failed
    },
  }
}
