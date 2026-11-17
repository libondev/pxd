import type { ChangeDetails } from '../types/shared/change'

/** One choice a component offers, as `snapshot` reports it. */
export interface AgentItem {
  /** What a person reads, and what `query` matches. */
  label?: string | number
  /** What a step passes to `setValue`. */
  value?: unknown
  /** Present when true, absent when it is not. */
  selected?: boolean
  disabled?: boolean
  expanded?: boolean
}

export interface AgentNode {
  name: string
  el: () => Element | null | undefined
  label?: () => string | undefined
  state?: () => Record<string, unknown>
  /** The choices it offers, read from its own data rather than from the DOM, so a
   *  virtualised list reports what it would show, not only the rows on screen. */
  items?: () => AgentItem[] | undefined
  actions: Record<string, (...args: any[]) => unknown>
}

export interface AgentComponent {
  /** What a step's `ref` and `query`'s `within` take. Stable while the component stays on the page. */
  ref: string
  component: string
  label?: string
  [state: string]: unknown
  /** The text of the buttons inside it, for a `press` step. */
  buttons?: string[]
  /** The choices it offers. Long lists are cut at `ITEM_LIMIT`; `itemCount` then carries the total. */
  items?: AgentItem[]
  /** How many choices there are, when more than `items` shows. */
  itemCount?: number
  actions: string[]
}

export interface AgentStep {
  ref: string
  action: string
  args?: any[]
}

/** A change a registered component made, as `subscribe` receives it. */
export interface AgentChange {
  ref: string
  component: string
  label?: string
  value: unknown
  /** Who caused it and whether a handler refused it; absent when nothing named a cause. */
  details?: ChangeDetails
}

export type AgentChangeListener = (change: AgentChange) => void

/** A step the app marked, as `allow` receives it before it runs. */
export interface AgentAllowedStep {
  ref: string
  component: string
  label?: string
  action: string
  /** What `data-agent-confirm` says the step does, in the words a person reads. */
  confirm: string
}

export interface AgentStepResult {
  ref: string
  result: unknown
}

export interface AgentActResult {
  ok: boolean
  results: AgentStepResult[]
  error?: { message: string; ref?: string; step?: number }
}
