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
- The state keys after `label` are the component's own, like `value`, `checked` or `disabled`.
- `buttons` lists the text of the buttons inside it, when it has any, for a `press` step.
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
- The result is `{ ok, results, error? }`. `results` holds `{ ref, result }` for the steps that ran; the run stops at the first failure, and `error` carries `{ message, ref }`.
- A change made by a step reports `source: 'agent'` in its `change` event (see below).
- The call resolves after the page has rendered what each step changed, so the next step and your own assertions see it.

## Press

`press` clicks a button the component shows, named by its text.

```ts
await agent.act({ steps: [{ ref: 'Show More', action: 'press' }] })
await agent.act({ steps: [{ ref: 'Views', action: 'press', args: ['Two'] }] })
```

- With no argument it presses the only button inside the component; a component with several asks you to name one.
- With an argument it presses the button whose text matches — the whole text first, then a part of it. Several matches are refused rather than guessed.
- A closed popup renders no buttons, so a component that declares `setOpen` is opened first and read again.

## Query

`query({ text, within, kind })` finds components by a part of their label, and is the way to reach a long list once `snapshot` stops being enough.

```ts
agent.query({ kind: 'checkbox' })
agent.query({ text: 'project' })
agent.query({ within: 'Views' })
```

- `text` matches any part of a label, ignoring case and accents.
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

## What is wired

A component appears in `snapshot` only when it declares itself to the bridge. Today that is:

| Component | Actions |
| --- | --- |
| `checkbox` | `setValue`, `toggle` |
| `checkbox-group` | `setValue` |
| `choicebox` | `setValue` |
| `color-selector` | `setValue` |
| `command-menu` | `setOpen`, `setQuery` |
| `date-picker` | `setValue`, `setOpen` |
| `drawer` | `setOpen` |
| `effort-slider` | `setValue` |
| `input` | `setValue`, `focus`, `blur`, `select` |
| `list` | `setValue`, `focus`, `dispatch` |
| `menu` | `setValue`, `setOpen`, `toggle` |
| `modal` | `setOpen` |
| `more-button` | `setValue`, `toggle` |
| `number-input` | `setValue`, `increment`, `decrement` |
| `pin-input` | `setValue` |
| `radio-group` | `setValue` |
| `rating` | `setValue` |
| `resizable` | `setValue` |
| `scroll-progress` | — |
| `select` | `setValue`, `setOpen`, `toggle` |
| `slider` | `setValue` |
| `steps` | `setValue` |
| `stick-to-bottom` | `scrollToBottom` |
| `switch` | `setValue` |
| `tabs` | `setValue` |
| `textarea` | `setValue`, `focus`, `blur` |
| `time-picker` | `setValue` |
| `toggle` | `setValue` |
| `toggle-button-group` | `setValue` |

A group — `checkbox-group`, `choicebox`, `radio-group`, `switch`, `toggle-button-group` — holds no value of its own: `setValue` announces the change and asks for the update, and the value follows only when the app's `v-model` accepts it.

`steps` moves only where the app marks it `clickable`, the same as a click. Its `value` is the current step's index.

`scroll-progress` reports its percentage and offers no action: a reading some other component's scroll produces, listed so an agent can see it.

A dialog renders nothing while it is closed, so it reports no `label` until it opens. A step reaches it by `ref`, opens it, and every later step can use the title as its name.

Any other component stays out of `snapshot`, `act` and `query`, so an agent cannot half-see or half-drive it.
