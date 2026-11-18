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
  /** What choosing it does, when a person must make that change. A step that names this
   *  choice is asked about first, marks or no marks on the page. */
  confirm?: string
}

export interface AgentNode {
  name: string
  el: () => Element | null | undefined
  /** Filled in by `useAgentNode`: the DOM anchor to read `data-agent-*` from when `el` is
   *  empty, as a closed dialog's is. A component never writes this itself. */
  scope?: () => Element | null
  /** The elements whose subtree is this component's own, like a menu's list: a component
   *  inside one belongs to it and stays out of the snapshot on its own. */
  owns?: () => (Element | null | undefined)[] | Element | null | undefined
  label?: () => string | undefined
  /** Which of its own parts names it, when its element carries no name: the button it shows as
   *  its face, like a menu's trigger, or the field it wraps, like a date picker's input. Unset
   *  by default, so a container is never named after a button in its content. */
  namedBy?: 'button' | 'field'
  /** What names it on its row, when that text is the component's own rather than its neighbours'. */
  row?: () => string | undefined
  state?: () => Record<string, unknown>
  /** The choices it offers, read from its own data rather than from the DOM, so a
   *  virtualised list reports what it would show, not only the rows on screen. */
  items?: () => AgentItem[] | undefined
  /** How many choices it has, when `items` reports only some of them: the snapshot then
   *  carries the rest as `itemCount` without building them. */
  count?: () => number | undefined
  /** The element one of its choices renders as, while it is on the page: the marks a step
   *  must read for that choice, like `data-agent-confirm`, live on it. A choice that only
   *  renders while its list is open has none until a step opens it. */
  itemElement?: (value: unknown) => Element | null | undefined
  /** Whether a click on its own element does what a person's press does. False for a
   *  component a click cannot drive, like a hold button, so `press` is refused instead of
   *  reported as done. */
  pressable?: () => boolean | undefined
  /** The elements whose buttons it presses: its own element by default. A component that only
   *  arranges the app's content, like a resizable's panels, reports none, so a press never
   *  reaches the buttons inside it. */
  pressRoots?: () => (Element | null | undefined)[] | Element | null | undefined
  /** Whether its own work is running, like a save, so a step waits for it to finish. */
  pending?: () => boolean | undefined
  /** Why its last action failed, so a step reports the failure instead of a silent success. */
  error?: () => unknown
  /** True when its value is always one of its items, so a step that names another is refused. */
  closed?: boolean
  /** True when its closed items hide other components, as a collapse's do. */
  reveals?: boolean
  actions: Record<string, (...args: any[]) => unknown>
}

export interface AgentComponent {
  /** What a step's `ref` and `query`'s `within` take. Stable while the component stays on the page. */
  ref: string
  component: string
  label?: string
  /** Other text on its row, like the name beside a table row's menu. */
  row?: string
  [state: string]: unknown
  /** The text of the buttons inside it, for a `press` step. */
  buttons?: string[]
  /** The choices it offers. Long lists are cut at `ITEM_LIMIT`; `itemCount` then carries the total. */
  items?: AgentItem[]
  /** How many choices there are, when more than `items` shows. */
  itemCount?: number
  /** `query({ text })` names the choices that made this component match, even past the cut. */
  matchedItems?: (string | number)[]
  /** What it shows besides its label, like a dialog's description. */
  text?: string[]
  /** Whether its own work is running right now. */
  pending?: boolean
  /** Why its last action failed. */
  error?: string
  /** What `data-agent-confirm` says the step does, in the words a person reads. */
  confirm?: string
  /** True for a component that left the page, with the state it had. */
  offPage?: boolean
  /** Where the app writes it, from `data-agent-source`. */
  source?: string
  /** How many matches a cut list left out, on the entry that ends it. */
  more?: number
  /** The call that finds the rest, `query`, on an entry that ends a cut list. */
  use?: string
  /** The first names a cut list left out, so a model knows what it cannot see. */
  sample?: string[]
  /** True when a component's own state or items getter failed; the entry is still addressable. */
  incomplete?: boolean
  actions: string[]
}

export interface AgentStep {
  ref: string
  action: string
  args?: any[]
}

export interface AgentSnapshotOptions {
  /** Include the choices each component offers. `true` by default; pass `false` for a page
   *  whose long lists would crowd out everything else, and read them with `query({ within })`. */
  items?: boolean
}

export interface AgentQuery {
  text?: string
  within?: string
  kind?: string
}

export interface AgentActOptions {
  steps: AgentStep[]
  /** How long the whole run may take, in milliseconds. Thirty seconds by default. */
  timeout?: number
  /** Ends the run before the next step, and stops waiting on the one in flight. */
  signal?: AbortSignal
}

/** One of the bridge's calls, described for a model to choose from. */
export interface AgentTool {
  /** Also the method that runs it: `agent[name](input)`. */
  name: 'snapshot' | 'act' | 'query'
  description: string
  /** JSON Schema of what the call takes. */
  inputSchema: Record<string, unknown>
}

/** A change a registered component made, as `subscribe` receives it. */
export interface AgentChange {
  ref: string
  component: string
  label?: string
  row?: string
  /** Which of its values changed, like `value`, `checked` or `open`. */
  key: string
  value: unknown
  /** The value before the change, so a listener can put it back. */
  previous: unknown
  /** Who caused it and whether a handler refused it; absent when nothing named a cause. */
  details?: ChangeDetails
}

export type AgentChangeListener = (change: AgentChange) => void

/** A step the app is asked about before it runs, marked or not. */
export interface AgentAllowedStep {
  ref: string
  component: string
  label?: string
  action: string
  /** What the step passes to the action, so a policy can read the value it would write. */
  args: unknown[]
  /** The elements this step touches: the component's own first, as `elementOf(ref)` names it,
   *  then the button it presses or the choice it names. A closed popup has not rendered them,
   *  so an entry can be empty. */
  els?: (Element | undefined)[]
  /** What `data-agent-confirm` says the step does, in the words a person reads. */
  confirm?: string
  /** Aborts when the step stops waiting, so a confirmation the app shows can close. */
  signal: AbortSignal
}

/** Refuses a step: return false, or a promise of false, and it does not run. */
export type AgentAllow = (step: AgentAllowedStep) => boolean | Promise<boolean>

export interface AgentStepResult {
  ref: string
  result: unknown
  /** The values this step changed, with the value each holds now. */
  changes?: AgentStepChange[]
  /** The components this step took off the page, by ref and name. */
  gone?: string[]
}

/** The bridge's own three calls, as a helper built around it sees them. */
export interface AgentBridge {
  snapshot: (options?: AgentSnapshotOptions) => AgentComponent[]
  act: (options: AgentActOptions) => Promise<AgentActResult>
  query: (options?: AgentQuery) => AgentComponent[]
}

/** One value a step changed. */
export interface AgentStepChange {
  ref: string
  component: string
  label?: string
  key: string
  value: unknown
}

export interface AgentActResult {
  ok: boolean
  results: AgentStepResult[]
  error?: { message: string; ref?: string; step?: number }
  /** The fields the run touched or that changed, named by ref and label, cut at its own
   *  limit; `more` says how many other fields the page has. */
  values: Record<string, unknown>
  /** The components the run brought onto the page, like an opened dialog's buttons. */
  appeared: AgentComponent[]
}
