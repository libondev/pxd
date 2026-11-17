# Agent

`createAgent` exposes the components on a page to an AI agent. The agent reads their state and calls their actions directly, so it never needs a screenshot, a page dump or a click.

## Connect

```ts
import { createAgent } from 'pxd/agent'

const agent = createAgent()
```

Create one bridge per page, in the browser. Every method reads the components that are mounted at the moment it is called.

## Snapshot

`snapshot()` returns one entry per component that declares itself to the bridge.

```ts
agent.snapshot()
// [
//   { ref: 'c1', component: 'input', label: 'Project name',
//     value: '', disabled: false, readonly: false,
//     actions: ['setValue', 'focus', 'blur', 'select'] },
// ]
```

- `ref` names the component in a step, and stays the same while the component stays mounted.
- `label` is the name a person reads for it, from `aria-label`, `aria-labelledby` or its `<label>`.
- The state keys after `label` are the component's own, like `value`, `checked` or `disabled`. A key that would collide with the bridge's — `ref`, `component`, `label`, `actions`, `buttons`, `items`, `confirm` — is dropped rather than allowed to overwrite them.
- `items` lists the choices it offers — a select's options, a tree's rows — with `value` for the step and `label` for you; the chosen one carries `selected`, an open branch `expanded`. A list longer than 100 stops there and reports `itemCount`. Items come from the component's data, not the DOM, so a virtualised list reports what it would show rather than the rows on screen.
- `buttons` lists the name of each button inside it — its accessible name, so an icon-only button carrying `aria-label` is listed and pressable too.
- `actions` lists what can be called right now.

A component that renders another one as its own root, like a number input over a text field, is reported once — as the wrapper, which owns the name a person reads.

## Act

`act({ steps })` runs steps in order. A step names a component by its `ref` or by its `label`, and one of its actions with arguments.

```ts
await agent.act({
  steps: [
    { ref: 'Project name', action: 'setValue', args: ['Atlas'] },
    { ref: 'Done', action: 'toggle' },
  ],
})
```

- A label must match exactly, ignoring case and accents. A label that matches more than one component is refused rather than guessed.
- The result is `{ ok, results, error? }`. `results` holds `{ ref, result }` for the steps that ran; the run stops at the first failure, and `error` carries `{ message, ref, step }`, where `step` is the index that failed.
- A change made by a step reports `source: 'agent'` in its `change` event (see below).
- The call resolves after the page has rendered what each step changed, so the next step and your own assertions see it.
- `timeout` caps the whole run (thirty seconds by default) and `signal` ends it: a step that outlives either fails with `Timed out after …` or `Canceled.`, and no further step runs. The step already in flight may still finish its work — the run stops waiting, it does not undo.
- One run at a time. Two calls on the same bridge queue, because interleaved steps would fight over the same component. A run that timed out releases the queue while its last step may still be finishing, so a following run can overlap it.

## Press

`press` clicks a button the component shows, named by its text.

```ts
await agent.act({ steps: [{ ref: 'Show More', action: 'press' }] })
await agent.act({ steps: [{ ref: 'Views', action: 'press', args: ['Two'] }] })
```

- With no argument it presses the only button inside the component; a component with several asks you to name one.
- With an argument it presses the button whose text matches — the whole text first, then a part of it. Several matches are refused rather than guessed.
- A closed popup renders no buttons, so a component that declares `setOpen` is opened first and read again.

## Subscribing

`subscribe(listener)` reports every change a wired component makes, whoever made it.

```ts
const stop = agent.subscribe((change) => {
  log(change.ref, change.component, change.value, change.details?.source)
})
```

| Field | Meaning |
| --- | --- |
| ref | The component that changed, the same `ref` a step uses. |
| component | Its name, like `input`. |
| label | The name a person reads, when it has one. |
| value | The value the change carried — a select's option, a list's selected item — not the component's whole state. |
| details | The `ChangeDetails` the event carried, including `canceled` once a handler has refused it. |

- A change a step made arrives with `details.source === 'agent'`, so one log line tells a person from an agent.
- Only the component a snapshot shows reports: an inner field whose wrapper owns the same element stays silent, and the wrapper announces the change it took from it. A region marked `data-agent-hidden` says nothing at all.
- `stop()` ends the subscription. A bridge nobody subscribed to builds no report at all.

## Handing it to a model

`agentTools` describes the three calls as JSON Schema, ready to pass as tool definitions:

```ts
import { agentTools, createAgent } from 'pxd/agent'

const agent = createAgent()

// Each tool is named after the method that runs it.
const run = (call: { name: 'snapshot' | 'act' | 'query', input: any }) => agent[call.name](call.input)
```

| Tool | Takes |
| --- | --- |
| snapshot | nothing |
| act | `steps` and an optional `timeout` |
| query | `text`, `within` or `kind` |

The bridge does not register itself as a browser agent tool: wiring that up is the app's call, and `agentTools` is what it needs to do so.

## Query

`query({ text, within, kind })` finds components by a part of their label, and is the way to reach a long list once `snapshot` stops being enough.

```ts
agent.query({ kind: 'checkbox' })
agent.query({ text: 'project' })
agent.query({ within: 'Views' })
```

- `text` matches any part of a label, or of one of the choices inside a component, ignoring case and accents.
- `kind` matches the component name, like `checkbox`.
- `within` limits the result to components inside the one it names; an unknown name returns an empty list.

## Change events

Every `change` reports `(value, details)`, and the details say who changed it and whether the change may stand.

```ts
import type { ChangeDetails } from 'pxd'

function onChange(value: string, details: ChangeDetails) {
  if (details.source === 'agent') {
    // a step did this, not a person
  }
}
```

| Field | Type | Meaning |
| --- | --- | --- |
| source | `'user' \| 'agent' \| 'programmatic' \| undefined` | Who changed it: a person, a step, or code. |
| reason | `string \| undefined` | Why it changed, from a closed list: a person's `'typed'`, `'cleared'`, `'item-press'`, `'trigger-press'`, `'escape-key'`, `'outside-press'`, `'close-press'`, `'step'`, `'settle'`; or `'api'` and `'sync'` when nobody pressed anything. |
| cancel | `() => void` | Refuses the write, where the component owns it: the value stays, and `update:model-value` is not emitted. |
| canceled | `boolean` | Whether `cancel()` was called. |

`source` is worked out, not declared: a step the bridge runs names itself, a write that carries the event behind it can only be a person's, and a write with no event is a person's only when its reason is an interaction (`'typed'`, `'item-press'`, …) — otherwise the call has to say `'programmatic'`, or the change reports no source at all. A write that says nothing claims nothing.

Every component that reports a value now writes through that entry, so a person's change carries `source: 'user'` and one of the reasons below. Where a component has no event to hand — a clear button calling `clear()` — the reason still says a person did it.

| Reason | Meaning |
| --- | --- |
| `typed` | A person typed into a field and it committed. |
| `cleared` | A person emptied a field. |
| `item-press` | A value was picked from a set of options, a tab or a step. |
| `trigger-press` | A control that flips or expands itself was pressed. |
| `escape-key`, `outside-press`, `close-press` | A dialog was dismissed: Escape, a click outside, or its close button. A command menu repeats the reason on its own `close` event. |
| `step` | A value moved one notch, usually by arrow keys. |
| `settle` | A drag or slide ended and its value was committed. |
| `api` | The bridge or a caller set the value. |
| `sync` | The component's own timing or a scroll moved it. |

The last two belong to nobody's press, so they report `source: 'programmatic'`.

A change the component commits, like a field on blur or a slider once the drag ends, carries no `cancel` — the value has already been applied.

## Keeping it in bounds

Three attributes on your own elements decide what an agent may do alone:

| Attribute | Effect |
| --- | --- |
| `data-agent-confirm="Deletes the project"` | A step on it, or inside it, is asked about first. Write the sentence for the person who will be asked. |
| `data-agent-secret` | Its value reads as `[redacted]`, and can still be set. A password field, `autocomplete="one-time-code"` or a `cc-*` field is secret without the attribute. |
| `data-agent-hidden` | The region stays out of `snapshot`, `act` and `query`, as if it were not on the page. |

`createAgent({ allow })` answers the question:

```ts
const agent = createAgent({
  allow: (step) => askThePerson(step.confirm),
  actTimeout: 30_000,
})
```

- `allow` receives `{ ref, component, label?, action, confirm }` and returns `true`, `false`, or a promise of either, for your own confirmation UI.
- Without `allow`, a marked step fails with `Needs a person` and nothing happens.
- A marked step waits `allowTimeout` milliseconds for the answer, five minutes by default.

## Naming what you want driven

A component is found by its label, and the label is the name a person reads: its `aria-label`, its `<label>`, the text of its button, or the name of the field it wraps. Nothing is invented, so a control with no text of its own appears in `snapshot` with a `ref` and no `label`:

- a `slider`, a `rating`, a `steps` bar or an `effort-slider` — the value is visual, the name is yours to give;
- `carousel`, `active-graph`, `calendar` — the content names nothing;
- any field without a visible `<label>`, like a `time-picker` or a `number-input`.

Pass `aria-label` to those and they are reachable by name; leave them and a step can still use their `ref`. The library deliberately ships no default names: two unlabeled slider used to answer to the same word, which is worse than having none.

## What is wired

A component appears in `snapshot` only when it declares itself to the bridge. Today that is:

| Component | Actions |
| --- | --- |
| `active-graph` | `setValue` |
| `approval-card` | `approve`, `reject`, `dismiss`, `reset` |
| `button` | — |
| `calendar` | `setValue`, `selectToday` |
| `carousel` | `next`, `previous`, `goTo`, `play`, `pause` |
| `checkbox` | `setValue`, `toggle` |
| `checkbox-group` | `setValue` |
| `choicebox` | `setValue` |
| `color-selector` | `setValue` |
| `command-menu` | `setOpen`, `setQuery` |
| `countdown` | `reset` |
| `date-picker` | `setValue`, `setOpen` |
| `drawer` | `setOpen` |
| `effort-slider` | `setValue` |
| `input` | `setValue`, `focus`, `blur`, `select` |
| `list` | `setValue`, `focus`, `dispatch` |
| `mention` | `setValue`, `insertText`, `insertMention`, `replaceQuery`, `focus`, `blur`, `clear` |
| `menu` | `setValue`, `setOpen`, `toggle` |
| `modal` | `setOpen` |
| `more-button` | `setValue`, `toggle` |
| `number-input` | `setValue`, `increment`, `decrement` |
| `pin-input` | `setValue` |
| `popover` | `setOpen`, `toggle` |
| `radio-group` | `setValue` |
| `rating` | `setValue` |
| `reactions` | `pick`, `toggle` |
| `resizable` | `setValue` |
| `scroll-progress` | — |
| `select` | `setValue`, `setOpen`, `toggle` |
| `slider` | `setValue` |
| `split-button` | `setValue` |
| `steps` | `setValue` |
| `stick-to-bottom` | `scrollToBottom` |
| `switch` | `setValue` |
| `tabs` | `setValue` |
| `textarea` | `setValue`, `focus`, `blur` |
| `time-picker` | `setValue` |
| `todo-list` | `start`, `complete`, `cancel`, `reset` |
| `toggle` | `setValue` |
| `tour` | `next`, `previous`, `goTo`, `close` |
| `tree` | `expandKey`, `collapseKey`, `expandAll`, `collapseAll`, `setActiveKey`, `scrollToKey`, `focus` |
| `toggle-button-group` | `setValue` |

A group — `checkbox-group`, `choicebox`, `radio-group`, `switch`, `toggle-button-group` — holds no value of its own: `setValue` announces the change and asks for the update, and the value follows only when the app's `v-model` accepts it.

`steps` moves only where the app marks it `clickable`, the same as a click. Its `value` is the current step's index.

`scroll-progress` reports its percentage and offers no action: a reading some other component's scroll produces, listed so an agent can see it. `button` is the same shape the other way round — no action of its own, because `press` already clicks it.

A dialog renders nothing while it is closed, so it reports no `label` until it opens. A step reaches it by `ref`, opens it, and every later step can use the title as its name.

Any other component stays out of `snapshot`, `act` and `query`, so an agent cannot half-see or half-drive it.
