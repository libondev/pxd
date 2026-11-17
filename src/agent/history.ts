import type { AgentBridge } from './types'
import { REDACTED } from './marks.js'
import { elementOf, observe } from './observe.js'
import { setterOf } from './stage.js'

/** One change the page made, as history keeps it. */
export interface AgentHistoryEntry {
  id: number
  ref: string
  label?: string
  key: string
  value: unknown
  /** The value before the change, which stepping back over it restores. */
  previous: unknown
  /** Who made it: `agent`, `user`, `programmatic`, or nothing when the write named no cause. */
  source?: string
  /** Reverted by `undo`, and put back by `redo`. */
  reverted: boolean
}

export interface AgentHistoryOptions {
  /** Hears only components inside this element, like one panel. Defaults to the whole page. */
  within?: Element | (() => Element | null | undefined)
  /** The keys worth an entry. @defaultValue ['value', 'checked', 'open'] */
  keys?: string[]
  /** The most entries kept; the oldest go first. @defaultValue 100 */
  limit?: number
}

/**
 * Records every change the page's controls make, from a person or an agent, and steps back
 * and forth over them through the bridge. A field whose value is `"[redacted]"` is never
 * recorded: it could not be put back. Changes made after stepping back drop the ones ahead,
 * as undo in an editor does.
 */
export function createHistory(
  agent: Pick<AgentBridge, 'act'>,
  { within, keys = ['value', 'checked', 'open'], limit = 100 }: AgentHistoryOptions = {},
) {
  const entries: AgentHistoryEntry[] = []
  let next = 1
  // A value this history is putting back is not a change to record.
  let restoring = false

  const stop = observe(
    (change) => {
      if (restoring || !keys.includes(change.key)) {
        return
      }

      if (change.value === REDACTED || change.previous === REDACTED) {
        return
      }

      for (let index = entries.length - 1; index >= 0 && entries[index].reverted; index--) {
        entries.pop()
      }

      const entry: AgentHistoryEntry = {
        id: next++,
        ref: change.ref,
        key: change.key,
        value: change.value,
        previous: change.previous,
        source: change.details?.source,
        reverted: false,
      }

      if (change.label) {
        entry.label = change.label
      }

      entries.push(entry)

      if (entries.length > limit) {
        entries.shift()
      }
    },
    { within },
  )

  const put = async (entry: AgentHistoryEntry, value: unknown) => {
    restoring = true

    try {
      const result = await agent.act({
        steps: [{ ref: entry.ref, action: setterOf(entry.key), args: [value] }],
      })

      return result.ok
    } finally {
      restoring = false
    }
  }

  return {
    /** The entries recorded so far, oldest first. */
    entries: () => [...entries],
    canUndo: () => entries.some((entry) => !entry.reverted),
    canRedo: () => entries.some((entry) => entry.reverted),
    /** Steps back over the last change that stands, and says whether it was put back. */
    async undo() {
      for (let index = entries.length - 1; index >= 0; index--) {
        const entry = entries[index]

        if (entry.reverted) {
          continue
        }

        // A control that left the page can never be put back. Its entry goes rather than
        // blocking every one behind it.
        if (!elementOf(entry.ref)) {
          entries.splice(index, 1)

          continue
        }

        const ok = await put(entry, entry.previous)

        if (ok) {
          entry.reverted = true
        }

        return ok
      }

      return false
    },
    /** Puts back the change `undo` stepped over most recently. */
    async redo() {
      for (const entry of entries) {
        if (!entry.reverted) {
          continue
        }

        const ok = await put(entry, entry.value)

        if (ok) {
          entry.reverted = false
        }

        return ok
      }

      return false
    },
    clear() {
      entries.length = 0
    },
    /** Stops recording. The entries stay, and can still be stepped over. */
    stop,
  }
}
