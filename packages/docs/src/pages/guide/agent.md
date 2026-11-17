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
- One run at a time. Two calls on the same bridge queue, because interleaved steps would fight over the same component.

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
| source | `'agent' \| undefined` | Who changed it: `'agent'` when a step did, `undefined` when nothing named a cause. |
| reason | `string \| undefined` | Why it changed, when the component declares one. |
| cancel | `() => void` | Refuses the write, where the component owns it: the value stays, and `update:model-value` is not emitted. |
| canceled | `boolean` | Whether `cancel()` was called. |

`source` names an agent's change and nothing else yet. No component tags a person's input today, so a change a person made reports no source rather than claiming to be one — more origins arrive as components learn to name them.

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
