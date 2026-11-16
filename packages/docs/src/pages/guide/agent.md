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
- `actions` lists what can be called right now.

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
| source | `'user' \| 'programmatic' \| 'agent' \| undefined` | Who changed it, when the component can tell. |
| reason | `string \| undefined` | Why it changed, when the component declares one. |
| cancel | `() => void` | Refuses the write, where the component owns it: the value stays, and `update:model-value` is not emitted. |
| canceled | `boolean` | Whether `cancel()` was called. |

A change the component commits, like a field on blur or a slider once the drag ends, carries no `cancel` — the value has already been applied.

## What is wired

A component appears in `snapshot` only when it declares itself to the bridge. Today that is:

| Component | Actions |
| --- | --- |
| `input` | `setValue`, `focus`, `blur`, `select` |
| `checkbox` | `setValue`, `toggle` |
| `tabs` | `setValue` |

Any other component stays out of `snapshot`, `act` and `query`, so an agent cannot half-see or half-drive it.
