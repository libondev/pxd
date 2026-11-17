import type { ChangeDetails } from '../../types/shared/change'
import { getCurrentInstance } from 'vue'
import { notifyAgentChange } from '../../agent/report.js'

type Emit = (event: any, ...args: any[]) => void

// Emits `change` and tells the bridge's subscribers about it, so a change a person made
// reaches the same listener as one a step made. Components outside the funnels use this;
// `useModelValue` and `useModelCommit` report from inside.
export function useAgentChange<E extends Emit>(emits: E) {
  const instance = getCurrentInstance()

  return (value: unknown, ...rest: unknown[]) => {
    emits('change', value, ...rest)

    if (instance) {
      notifyAgentChange(instance, value, rest.at(-1) as ChangeDetails | undefined)
    }
  }
}
