import type { AgentChangeListener } from './types'
import { agentElement, agentEntry } from './registry.js'
import { subscribeAgentChanges } from './report.js'

export interface AgentObserveOptions {
  /** Hear only what happens inside this element, or the element it returns, like one panel. */
  within?: Element | (() => Element | null | undefined)
}

/**
 * Every change a wired component makes, from a person or an agent, until the returned
 * function runs. A change arrives once it commits: a slider's drag is one change, not one
 * per pixel. `within` keeps a single region, like one panel of a page.
 */
export function observe(
  listener: AgentChangeListener,
  { within }: AgentObserveOptions = {},
): () => void {
  if (!within) {
    return subscribeAgentChanges(listener)
  }

  return subscribeAgentChanges((change) => {
    const root = typeof within === 'function' ? within() : within
    const el = elementOf(change.ref)

    // A ref that names nothing now left the page; its element is gone with it.
    if (root && el && root.contains(el)) {
      listener(change)
    }
  })
}

/** The element a ref names, for pointing at what an agent just changed. */
export function elementOf(ref: string): Element | undefined {
  const entry = agentEntry(ref)

  return entry ? (agentElement(entry) ?? undefined) : undefined
}
