# Agent

`createAgent` exposes the components on a page to an AI agent. The agent reads their state and calls their actions directly, so it never needs a screenshot, a page dump or a click.

## Connect

```ts
import { createAgent } from 'pxd/agent'

const agent = createAgent()
```

Create one bridge per page, in the browser. Every method reads the components that are mounted at the moment it is called.

## Try it

The controls below are ordinary `pxd` components. The buttons ask the bridge for its snapshot, drive several different kinds of value in one run, press a button by its name, and look for a component by one of its choices. Everything the bridge returns is printed underneath.

```vue demo
<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { createAgent } from 'pxd/agent'

const name = ref('')
const done = ref(false)
const view = ref('overview')
const region = ref<string | null>(null)
const size = ref<string | number>('')
const volume = ref(20)
const saved = ref(false)
const output = ref('Press a button to see what the bridge returns.')
const lastChange = ref('')

const agent = createAgent()

let stop: () => void

// Only listen in the browser: a static build renders the page without a DOM to change.
onMounted(() => {
  stop = agent.subscribe((change) => {
    lastChange.value = `${change.component}: ${change.details?.reason ?? 'changed'} (${change.details?.source ?? 'no source'})`
  })
})

onUnmounted(() => stop?.())

const views = [
  { label: 'Overview', value: 'overview' },
  { label: 'Details', value: 'details' },
]

const regions = [
  { label: 'Europe', value: 'eu' },
  { label: 'Asia', value: 'as' },
]

const sizes = [
  { label: 'Small', value: 'sm' },
  { label: 'Large', value: 'lg' },
]

function show(value: unknown) {
  output.value = JSON.stringify(value, null, 2)
}

async function runSteps() {
  show(await agent.act({
    steps: [
      { ref: 'Project name', action: 'setValue', args: ['Atlas'] },
      { ref: 'Done', action: 'setValue', args: [true] },
      { ref: 'Views', action: 'setValue', args: ['details'] },
      { ref: 'Region', action: 'setValue', args: ['eu'] },
      { ref: 'Size', action: 'setValue', args: ['lg'] },
      { ref: 'Volume', action: 'setValue', args: [72] },
    ],
  }))
}

async function pressSave() {
  show(await agent.act({ steps: [{ ref: 'Save', action: 'press', args: ['Save'] }] }))
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="grid gap-4 sm:grid-cols-2">
      <PInput v-model="name" aria-label="Project name" />
      <PCheckbox v-model="done" aria-label="Done" />
      <PSelect v-model="region" aria-label="Region" :options="regions" placeholder="Pick a region" />
      <PRadioGroup v-model="size" aria-label="Size" :options="sizes" />
      <PSlider v-model="volume" aria-label="Volume" :min="0" :max="100" />
    </div>

    <PTabs v-model="view" aria-label="Views" :options="views" />

    <div class="flex flex-wrap items-center gap-2">
      <PButton @click="saved = false">Reset</PButton>
      <PButton @click="saved = true">Save</PButton>
      <span class="text-sm">Saved: {{ saved }}</span>
    </div>

    <div class="flex flex-wrap gap-2">
      <PButton @click="show(agent.snapshot())">Snapshot</PButton>
      <PButton @click="runSteps()">Run steps</PButton>
      <PButton @click="pressSave()">Press Save</PButton>
      <PButton @click="show(agent.query({ text: 'Europe' }))">Query items</PButton>
    </div>

    <p v-if="lastChange" class="text-sm">Last change: {{ lastChange }}</p>
    <pre class="max-h-72 overflow-auto rounded-lg bg-background-200 p-4 text-xs">{{ output }}</pre>
  </div>
</template>
```

Six steps in one run show that `setValue` takes whatever each component takes: a string, a boolean, a choice from `options`, and a number the slider clamps to its own range. `press` is a bridge action, not one of the component's own — it clicks the button whose accessible name it is given. `query({ text: 'Europe' })` finds the select by a choice, and `matchedItems` names the choice that hit even when it is past the hundred a snapshot shows. The snapshot lists every `pxd` component on this page, including the ones in the surrounding docs UI: the registry belongs to the page, not to the demo.

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

- `ref` names the component in a step. It stays the same while the component is mounted, and a component that leaves and comes back takes its old ref again.
- `label` is the name a person reads for it, from `aria-label`, `aria-labelledby` or its `<label>`.
- `row` is the text beside it on the same row — a table row's name next to its menu — so two identical controls can be told apart and reached by that text.
- The state keys after `label` are the component's own, like `value`, `checked` or `disabled`. A key that would collide with the bridge's — `ref`, `component`, `label`, `row`, `actions`, `buttons`, `items`, `itemCount`, `matchedItems`, `confirm`, `pending`, `error`, `offPage`, `source`, `more`, `use` — is dropped rather than allowed to overwrite them.
- `disabled: true` means the component takes no action right now: `actions` is empty, `press` is refused, and a step on it fails instead of writing to a control a person cannot use.
- `pending: true` and `error` report a component whose own work is running or has failed, like a button's save.
- `incomplete: true` means one of the component's own state or item getters threw. The entry stays addressable instead of taking down the whole snapshot, but its data is not complete.
- `items` lists the choices it offers — a select's options, a tree's rows — with `value` for the step and `label` for you; the chosen one carries `selected`, an open branch `expanded`, one a person cannot pick `disabled`, and one a person must approve `confirm`. A list longer than 100 stops there and reports `itemCount`; `query({ within })` reads the rest. Items come from the component's data, not the DOM, so a virtualised list reports what it would show rather than the rows on screen, and a list that counts its own rows reports the rest through `itemCount` without building them.
- `snapshot({ items: false })` leaves the choices out entirely — the component's items getter is not even read — for a page whose long lists would crowd out everything else. `query({ within })` then reads one list at a time.
- `buttons` lists the name of each button it renders — its accessible name, so an icon-only button carrying `aria-label` is listed and pressable too. A link with an `href` counts as a button, so a pager's Prev and Next can be pressed. A component that only arranges your markup reports none: `resizable`, `steps`, `list`, `virtual-list` and `stick-to-bottom` leave their content's buttons to the app.
- `text` carries what it says besides its name, like a dialog's description, read from the element its own `aria-describedby` points at.
- `actions` lists what can be called right now.
- `source` says where the app writes it, when the element carries `data-agent-source`, like `src/pages/settings.vue:24`.
- A component that left the page follows with `offPage: true` and the state it had, like a closed tab's fields. Only what left while the bridge was listening is reported, fifty at most.
- A page with more than 100 components stops there and ends with `{ ref: 'more', component: 'more', more, use: 'query' }`: `more` says how many were left out, and `sample` names the first three of them, so nothing goes missing without a hint that it exists.

What it reports is what a person can reach: a region marked `data-agent-hidden` or `aria-hidden="true"`, a control inside a closed `<details>`, and anything the browser says is not visible stay out of the snapshot entirely.

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

- A step names its component by `ref`, by its `label`, by the text on its `row`, or by its kind like `select`. A name matches exactly, or as whole words within the label and row, so `name` finds `Display name` but not `Username`. Two components that answer to the same name are refused, and the error lists each one's ref.
- A value can be written as the choice's label rather than its value: `setValue: ['Europe']` picks the option whose value is `eu`. A list that holds only its own items — `select`, `list`, `menu`, `tabs`, `radio-group`, `checkbox-group`, `choicebox`, `toggle-button-group`, `steps` and `effort-slider` — refuses anything else and names the items it does have, except a value it already holds. A number is read out of text — `'40'` becomes `40` — and a checkbox takes `true` or `false`, never the string `'true'`.
- The result is `{ ok, results, error?, values, appeared }`. `results` holds `{ ref, result }` for the steps that ran; the run stops at the first failure, and `error` carries `{ message, ref, step }`, where `step` is the index that failed.
- `values` holds the fields the run touched or that changed, named by ref and label, so an agent checks its work without another snapshot. A field is a component's value or checked state; other state a step moves, like a hold button's `status`, is in that step's `changes`. A field it neither set nor saw change holds what it already knew, so it is left out and `more` says how many such fields the page still has. `appeared` lists the components the run brought onto the page, like an opened dialog's buttons.
- Each entry in `results` carries what that step did: `changes` names the values it changed and what each holds now, and `gone` names the components it took off the page, like a removed row's menu.
- A step on a component that reports `disabled` or `readonly` fails instead of writing to it, checked again after `allow` answers.
- A step waits for the component's own work: while it reports `pending`, up to fifteen seconds, and a component that reports `error` fails the step with it.
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

- With no argument it presses the only button the component shows; a component with several asks you to name one.
- A button counts as the component's when the component renders it, or when it sits in content that component reveals — a dialog, a swipe cell, a popover. A container that only arranges your markup, like `resizable`, refuses the press instead of reaching into its panels.
- With an argument it presses the button whose text matches — the whole text first, then a part of it. Several matches are refused rather than guessed. A link with an `href`, like a pager's Prev, is pressed the same way.
- A closed popup renders no buttons, and a press does not open one to look inside: the step fails and names the action that opens it. Open it as a step of its own, then press. That way the page never changes under a person just to find out what a press would click, and opening something is a step `allow` sees.
- A disabled component, or a disabled button, is refused rather than clicked.
- It waits through three renders, each across a macrotask, within the run's timeout. Content that arrives from a network request later than that still needs the app to have it ready; `press` does not poll indefinitely.

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
| row | The text on its row, when it has any. |
| key | Which of its values changed: `value`, a checkbox's `checked`, a dialog's `open`. |
| value | The value the change carried — a select's option, a list's selected item — not the component's whole state. |
| previous | The value before the change, so a listener can put it back. A change cancelled by a handler never arrives. |
| details | The `ChangeDetails` the event carried, including `canceled` once a handler has refused it. |

- A change a step made arrives with `details.source === 'agent'`, so one log line tells a person from an agent.
- A password, one-time-code or card field, and any field inside `data-agent-secret`, reports `value` and `previous` as `[redacted]`: the bridge never passes on what it must not read.
- Only the component a snapshot shows reports: an inner field whose wrapper owns the same element stays silent, and the wrapper announces the change it took from it. A region marked `data-agent-hidden` says nothing at all.
- `stop()` ends the subscription. A bridge nobody subscribed to builds no report at all.

## Watching and stepping back

Four calls build on the same registry, for an app that wants more than a step's result:

```ts
import { createHistory, elementOf, observe, stageChanges } from 'pxd/agent'

const stop = observe((change) => log(change.key, change.previous, change.value), {
  within: panel,
})

const staged = await stageChanges(agent, [{ ref: 'Volume', value: 80 }])
await staged.revert()

const history = createHistory(agent, { keys: ['value', 'checked'] })
await history.undo()
await history.redo()

highlight(elementOf(ref))
```

| Call | What it does |
| --- | --- |
| `observe(listener, { within })` | Every change, from a person or an agent, with `ref`, `key`, `value`, `previous`, `reason` and `source`. A change arrives once it commits: a slider's drag is one change, not one per pixel. |
| `elementOf(ref)` | The element a ref names, for pointing at what an agent just changed. |
| `stageChanges(agent, changes)` | Puts values on the real controls and returns `{ applied, revert }`: a suggestion a person can look at, then put back. A secret field's value before reads `[redacted]`, so it is never restored. |
| `createHistory(agent, { keys, within, limit })` | Records changes and steps back and forth over them through the bridge. A change made after stepping back drops the ones ahead, as undo in an editor does. A secret value is never recorded. |

`createHistory` records every source, so a person's change and an agent's live in one list; its `entries()` say who made each one.

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
| snapshot | an optional `items: false` to leave the choices out |
| act | `steps` and an optional `timeout` |
| query | `text`, `within` or `kind` |

A browser that carries its own agent can have the three tools directly, through WebMCP:

```ts
import { createAgent, registerTools } from 'pxd/agent'

const agent = createAgent({ allow: (step) => (step.confirm ? askThePerson(step.confirm) : true) })

// Nothing happens in a browser without `document.modelContext`.
const unregister = registerTools(agent, { allow: (step) => step.action !== 'press' })
```

`registerTools` needs an `allow` of its own, because that agent is not the app's: it decides every step after the bridge's own check. The tools are registered as `readOnlyHint` for `snapshot` and `query`, and `consequentialHint` for `act`, so the browser knows which one changes the page.

## Query

`query({ text, within, kind })` finds components by a part of their label, and is the way to reach a long list once `snapshot` stops being enough.

```ts
agent.query({ kind: 'checkbox' })
agent.query({ text: 'project' })
agent.query({ within: 'Region' })
```

- `text` matches any part of a label or of the text on a row, or of one of the choices inside a component, ignoring case and accents.
- `kind` matches the component name, like `checkbox`.
- `within` names one component and returns it with its own choices, fifty at most, matching `text` when given — a select's five hundred options can be read without listing the page. Past fifty it carries `more`, the count left out. It never opens anything: a list that keeps its choices only in the DOM comes back without them, and a step opens it first. An unknown name returns an empty list.
- Without `within`, it reads every choice, not only the first hundred a snapshot shows. `matchedItems` names the choices that made a component match, including ones past that cut.
- More than a hundred matches stop there, with a `more` entry at the end, the same as a snapshot.

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
| reason | `string \| undefined` | Why it changed, from a closed list: a person's `'typed'`, `'cleared'`, `'item-press'`, `'trigger-press'`, `'escape-key'`, `'outside-press'`, `'close-press'`, `'swipe'`, `'step'`, `'settle'`, `'drag'`, `'pinch'`, `'wheel'`, `'step-key'`, `'zoom-key'`, `'zoom-input'`, `'rotate-key'`, `'rotate-press'`, `'flip-press'`; or `'api'`, `'sync'`, `'image-load'` and `'aspect-ratio-change'` when nobody pressed anything. |
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
| `escape-key`, `outside-press`, `close-press`, `swipe` | A dialog was dismissed: Escape, a click outside, its close button, or a drag on its sheet handle. A command menu repeats the reason on its own `close` event. |
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
| `data-agent-confirm="Deletes the project"` | A step on it, and a `press` on a button inside it, is asked about first. Write the sentence for the person who will be asked. |
| `data-agent-secret` | Its value reads as `[redacted]` — in a snapshot, in a `subscribe` change and in an `act` result — and it reports no `label`, `row`, `items` or `buttons`, which can be as revealing as the value. It can still be set. A password field, `autocomplete="one-time-code"` or a `cc-*` field is secret without the attribute. |
| `data-agent-hidden` | The region stays out of `snapshot`, `act` and `query`, as if it were not on the page — including a step that names a component by its `ref`. A hidden button cannot be pressed either. |

A mark on a component covers every step on that component — `setValue`, `setOpen`, and a press on its own button. A mark on one of its choices is read while that element is on the page, so a rendered row can be marked on its own, inside the row's content or around it.

A choice that only renders while a list is open has no element to read, so it carries its sentence in its own data instead: the `confirm` field of its option, which a step reads even while the menu is closed, the row is past the window, or a query hides it.

A `data-agent-source` attribute, on a component or an element around it, puts its location in the snapshot, like `src/pages/settings.vue:24`, so a model can say where a control is written. A misspelled `data-agent-*` name warns in development and does nothing.

`createAgent({ allow })` answers the question:

```ts
const agent = createAgent({
  allow: (step) => (step.confirm ? askThePerson(step.confirm) : true),
  actTimeout: 30_000,
})
```

- `allow` is asked about **every** step, marked or not, and receives `{ ref, component, label?, action, args, els, confirm?, signal }`. Return `true`, `false`, or a promise of either, for your own confirmation UI — so an app can refuse a step for its own reasons, like an amount it will not let an agent set, or a control only its owner may change. `signal` aborts when the step stops waiting, so a dialog you opened can close.
- `els` is what the step would touch: the component's own element first, as `elementOf(ref)` names it, then the button `press` would click or the choice the step names. Its positions are fixed, so the second entry is always that button or choice, and an entry is empty when the page has not rendered it — a closed popup's choice, or a closed dialog's own element. Read the app's own marks off it, like `step.els?.[1]?.hasAttribute('data-press-ok')`.
- Without `allow`, a marked step fails with `Needs a person` and nothing happens; unmarked steps run.
- The mark is read from the component's place in the page, so a dialog that has not rendered yet still asks before `setOpen`.
- A step waits `allowTimeout` milliseconds for the answer, five minutes by default, and then fails without running.
- A failure says which gate refused: `Refused setValue on c3 by the app.`, or `by registerTools' allow` when the browser's tools refused it, or `Nobody answered in time for setValue on c3.` when `allow` never answered.

## Testing what an agent may do

`pxd/agent/testing` reads a bridge the way a test does. Every call throws when the assertion fails, so no test runner is needed:

```ts
import { inspectAgent } from "pxd/agent/testing"

const view = inspectAgent({ allow: () => true })

view.component("Region", { value: "eu", actions: ["setValue", "setOpen", "toggle"] })
view.absent("checkbox")
await view.refuse({ ref: "Account", action: "setValue", args: ["x"] }, "Needs a person")
await view.run({ ref: "Region", action: "setValue", args: ["eu"] })
```

`component` finds a component the way a step does — by ref, label, row text or kind — and matches the keys you name, failing with both sides when one differs. `absent` passes only when nothing answers to the name. `run` throws with the step that stopped it, and `refuse` throws when the step ran, matching the words you give it when you give any. `inspectAgent(agent)` wraps a bridge a test already made; with no argument it builds one.

## Naming what you want driven

A component is found by its label, and the label is the name a person reads: its `aria-label`, its `aria-labelledby`, its `<label>`. A component whose face is a control of its own is named by that control: a `popover`, `menu`, `select` or `split-button` by its trigger button, a `more-button` by the button it shows, a `date-picker` or `time-picker` by its field. Nothing else is invented, so a component with no name of its own appears in `snapshot` with a `ref` and no `label`:

- a `slider`, a `rating`, a `steps` bar or an `effort-slider` — the value is visual, the name is yours to give;
- `carousel`, `active-graph`, `calendar`, `tabs`, `resizable` — the content names nothing;
- `approval-card`, `radio-group`, `choicebox`, `toggle-button-group` — their buttons and choices are theirs to press, not their name;
- `drawer` and `modal` without a title — the title names them when there is one;
- any field without a visible `<label>`, like a `time-picker` or a `number-input`.

Pass `aria-label` to those and they are reachable by name; leave them and a step can still use their `ref`. The library deliberately ships no default names: two unlabeled slider used to answer to the same word, which is worse than having none, and a container named after a button in its content is worse still, since a step that reads right then changes something else.

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
| `collapse` | `setOpen`, `toggle` |
| `color-selector` | `setValue` |
| `command-menu` | `setOpen`, `setQuery` |
| `context-usage` | — |
| `countdown` | `reset` |
| `date-picker` | `setValue`, `setOpen` |
| `drawer` | `setOpen` |
| `effort-slider` | `setValue` |
| `form` | `validate`, `submit` |
| `gauge` | — |
| `hold-button` | `hold` |
| `image-cropper` | `setCrop`, `rotate`, `flip`, `setZoom` |
| `image-preview` | `setOpen`, `setValue`, `zoomIn`, `zoomOut`, `rotate`, `reset` |
| `input` | `setValue`, `focus`, `blur`, `select` |
| `list` | `setValue`, `focus`, `dispatch` |
| `mention` | `setValue`, `insertText`, `insertMention`, `replaceQuery`, `focus`, `blur`, `clear` |
| `menu` | `setValue`, `setOpen`, `toggle` |
| `modal` | `setOpen` |
| `more-button` | `setValue`, `toggle` |
| `number-input` | `setValue`, `increment`, `decrement` |
| `page-number` | `setValue`, `setPageSize` |
| `pagination` | — |
| `pin-input` | `setValue` |
| `popover` | `setOpen`, `toggle` |
| `progress` | — |
| `questionnaire` | `answer`, `answerText`, `next`, `previous`, `skip`, `skipAll`, `submit` |
| `radio` | `select` |
| `radio-group` | `setValue` |
| `rating` | `setValue` |
| `reactions` | `pick`, `toggle` |
| `resizable` | `setValue` |
| `scroll-progress` | — |
| `search-input` | `setValue`, `search`, `focus`, `blur`, `select` |
| `select` | `setValue`, `setOpen`, `toggle` |
| `slider` | `setValue` |
| `split-button` | `setValue` |
| `steps` | `setValue` |
| `stick-to-bottom` | `scrollToBottom` |
| `swipe-cell` | `open`, `close` |
| `switch` | `setValue` |
| `tabs` | `setValue` |
| `textarea` | `setValue`, `focus`, `blur` |
| `time-picker` | `setValue` |
| `toc` | `setValue` |
| `todo-list` | `start`, `complete`, `cancel`, `reset` |
| `toggle` | `setValue` |
| `toggle-button` | `setValue`, `toggle` |
| `tour` | `next`, `previous`, `goTo`, `close` |
| `tree` | `expandKey`, `collapseKey`, `expandAll`, `collapseAll`, `setActiveKey`, `scrollToKey`, `focus` |
| `toggle-button-group` | `setValue` |
| `virtual-list` | `scrollToIndex`, `scrollToOffset`, `scrollBy`, `retry` |

A group — `checkbox-group`, `choicebox`, `radio-group`, `switch`, `toggle-button-group` — holds no value of its own: `setValue` announces the change and asks for the update, and the value follows only when the app's `v-model` accepts it. A group that renders its choices from `options` reports them once, and its boxes, radios or toggle buttons stay out of the snapshot. A group whose choices are written in its slot lists none: each one reports itself, with the state it holds and the action a press on it would take.

`steps` moves only where the app marks it `clickable`, the same as a click. Its `value` is the current step's index.

`scroll-progress` reports its percentage and offers no action: a reading some other component's scroll produces, listed so an agent can see it. `progress`, `gauge` and `context-usage` are the same: they show a reading and no step sets it. `button` is the same shape the other way round — no action of its own, because `press` already clicks it. `pagination` is the third: it holds no value, and its Prev and Next links are pressed by their text. `page-number` reports the page it is on, how many there are and the size it lists, so a step can take a page directly.

`hold-button` is the reverse of a button: `press` is refused on it, because a click cannot confirm a hold, and `hold` runs the same confirmation a person's press-and-hold does. A step that names it waits for the hold to confirm, and a mark on it asks before the hold starts.

`collapse` reveals its content: while it is closed, the controls inside it stay out of the snapshot, and a step that names one is told which closed section to open first.

`select` and `menu` report themselves alone while their list is open: the list is part of the control, and the control takes the same value. Their list is left out of the snapshot, since it is the same choice set twice. A `command-menu` keeps its list instead, and reports no choices while it is there: choosing a command is what that list does, and the menu itself only opens and filters.

`search-input` carries the name a person typed and the call that submits it: `setValue` writes the box, and `search` runs what Enter runs on a page whose only way to send it is the key.

`virtual-list` reports the rows its data holds rather than the few the window draws — its state carries `count`, and `items` stops at the hundred a snapshot shows, with `itemCount` for the rest — and `scrollToIndex` reaches one that is not drawn yet.

`image-preview` renders nothing while it is closed, like a dialog: `setOpen` opens it, and the images it knows are the `items` that `setValue` picks from.

`toc` is `closed`: `setValue` takes an entry's label or id, refuses anything else with the ones it has, and scrolls there.

`swipe-cell` reports the side it has open, or `false` when it is shut; `open` and `close` move it as a drag would.

`toggle-button` is reported only on its own. Inside a `toggle-button-group` the group holds the value, so the buttons stay out of the snapshot.

`questionnaire` is named by the current question's header, with the question itself on its `row`, so an agent can find it by either. Its `items` are the current question's options, and `answer` takes one by its label — a single choice replaces the answer and moves on, a multiple one toggles and stays. `answerText` types the freeform answer, and `submit` reports the answers through `submit`, so put `data-agent-confirm` on the questionnaire if sending them needs a person.

A dialog renders nothing while it is closed, so it reports no `label` until it opens. A step reaches it by `ref`, opens it, and every later step can use the title as its name.

A tooltip is an explanation rather than a control: the popover under it stays out of `snapshot`, `act` and `query`, so an info icon neither adds an entry nor offers a way to open it. `PPopover` takes `:agent="false"` for the same reason on a popover you build yourself. An icon whose only job is that explanation can also carry `data-agent-hidden` itself, which keeps it out of `buttons` on the component that holds it — a `resizable`'s panel or a card's content — while the rest of that component stays reachable.

Any other component stays out of `snapshot`, `act` and `query`, so an agent cannot half-see or half-drive it.
