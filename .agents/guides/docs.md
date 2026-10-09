# Documentation Guide

## Scope

Component docs live in `packages/docs/src/pages/components/`, one `<kebab-name>.md` per page.
The file name always equals the component directory name under `src/components/`.
Composable docs live in `packages/docs/src/pages/composables/` and are not covered by this guide.

This file is the **single source of truth for the API tables**. When you add or update a component
page, follow it exactly — do not invent new column names, headings, or wording.

## Page skeleton

```md
# Component Name

One-paragraph summary of what the component is for.

## Default            <- runnable ```vue demo``` blocks, one per capability
## Some Variant
## Props              <- API reference, always in this order
## Events
## Slots
## Methods
```

**Required order of the API sections: `Props` → `Events` → `Slots` → `Methods`.**
`Methods` always comes last, after `Slots`.

Sub-components that are documented on the parent page get their own titled sections, placed
immediately after the parent section they belong to. The parent's own `Events` section stays right
after the parent's own `Props`:

```md
## Props
## Events
## CheckboxGroup Props
## CheckboxGroup Events
## Slots
```

## Where the API surface comes from

Always derive the tables from source, never from memory or from an older version of the page.

| Section | Source of truth |
| --- | --- |
| Props | `defineProps<XxxProps>()` → `src/components/<name>/types.d.ts` |
| Events | `defineEmits<XxxEmits>()` → `src/components/<name>/types.d.ts` |
| Methods | `defineExpose({ … })` → `src/components/<name>/index.vue` |
| Slots | `<slot … />` calls in `src/components/<name>/index.vue` |

- A component declares its events as `XxxEmits: { 'event-name': [payloadArg: Type] }`.
  The tuple is the payload. `[]` means the event carries no payload.
- `defineExpose({ … })` lists everything reachable through a template `ref`. Document **all** of
  it in `Methods` — both functions and exposed refs/computeds — and mark each one's type accurately.
- `defineExpose(useForwardRefExpose(innerRef))` forwards to an inner component; document the
  forwarded API (see `search-input.md`, which forwards `PInput`).
- Sub-components without their own page are documented on the parent page. Add
  `## <ComponentName> Events` for them, using the same table format.

## Events

`Events` documents **what the component emits to the outside while it is used** — every entry of its
`XxxEmits` interface, plus `update:modelValue` when the component is controllable.

```md
## Events

| Name | Type | Description |
| --- | --- | --- |
| open | `(side: 'prefix' \| 'suffix') => void` | Emitted when the cell opens. |
| close | `() => void` | Emitted when the cell closes. |
| update:modelValue | `(side: 'prefix' \| 'suffix' \| false) => void` | Emitted when the open state changes. |
```

Rules:

- Heading is always `## Events`. Never `## Emits`.
- Columns are always `| Name | Type | Description |`.
- **Name** is the event name exactly as declared in the source, including casing — `over-swipe`,
  `panel-change`, `update:modelValue`. Do not rewrite it as `update:model-value`.
- Write the name **unquoted and unbackticked** — a bare `update:modelValue`, never `'update:modelValue'`.
  The Type cell already carries the backticks.
- **Type** is the full handler signature in backticks, with the payload argument names from the
  source: `(side: SwipeCellSide) => void`, `(value: number) => void`, `() => void`.
  Escape every `|` inside the cell as `\|`.
- **Description** is one English sentence starting with `Emitted` and ending with a period.
  Say *when* it fires, not what it carries — the Type column already carries the payload.
  Good: `Emitted when the cell closes.` / `Emitted when Enter is pressed with a non-empty value.`
- Order the rows as declared in the `XxxEmits` interface, not alphabetically.
- A payload with named fields that needs unpacking gets a fenced `ts` block after the table
  (see `questionnaire.md`).

### Dead event declarations

An event that nothing dispatches must not get a row — a handler bound to it never runs.

Dispatch is usually indirect, so a missing `emits()` call in one file proves nothing. Check the
three carriers:

1. The component — `emits('<name>', …)` in `index.vue`.
2. A composable it calls — `useModelValue` dispatches `change` / `update:modelValue`,
   `use-countdown` dispatches `change` / `reset` / `finish`. Calling one for its **getter only**
   (`useModelValue(props, emits, { get })`, result never assigned) dispatches nothing.
3. A child through an injected context — `checkbox-group` passes `emits` into
   `provideCheckboxGroupContext({ props, emits })` and the child dispatches.

Corroborate with `grep -rn "emitted('<name>')" tests/`: an assertion proves the event fires,
silence only means trace further. When no carrier dispatches it, fix the source before writing the
row — add the dispatch plus a test if it should fire, delete it from `XxxEmits` if it cannot.
Never ship a row that papers over the mismatch ("declared but never dispatched").

## Methods

`Methods` documents **what the component exposes to the outside through a template `ref`** — the
contents of `defineExpose()`. Declarative props/slots do not belong here; imperative calls do.

```md
## Methods

| Name | Type | Description |
| --- | --- | --- |
| open | `(side: 'prefix' \| 'suffix') => Promise<boolean>` | Open a side imperatively. |
| close | `(trigger?: SwipeCellCloseTrigger) => Promise<boolean>` | Close imperatively. |
```

Rules:

- Heading is always `## Methods`. Never `## Exposed` / `## Exposes`.
- Columns are always `| Name | Type | Description |` — never a two-column `| Name | Description |`.
- Exposed refs and computeds are listed too, with their unwrapped value type:
  `| isAtBottom | `boolean` | Whether the container is scrolled to the bottom. |`
- **Description** is one English sentence in the imperative, starting with a capitalised verb and
  ending with a period: `Reset the countdown.`, `Removes the active outline.`
- Keep the order of `defineExpose()`.

## Slots

`Slots` is unchanged by this guide, but it must keep its existing shape:

```md
## Slots

| Name | Description |
| --- | --- |
| default | Cell content. |
| suffix | Right action area. Slot props: `side`, `active`, `distance`. |
```

## Empty sections

**Omit the section entirely when it would be empty.** A component with no `XxxEmits` gets no
`## Events` heading; a component with no `defineExpose` gets no `## Methods` heading. Never write
an empty table or a "This component emits no events." placeholder.

## Checklist

Before declaring a component page done:

- [ ] Every entry of `XxxEmits` appears in `## Events` with its real payload signature.
- [ ] Every `XxxEmits` entry has a real dispatch path — the component, a composable it calls, or a child via context (see *Dead event declarations*).
- [ ] Every entry of `defineExpose()` appears in `## Methods`.
- [ ] Sub-components documented on the page have their own `## <Name> Events` section.
- [ ] Section order is `Props` → `Events` → `Slots` → `Methods`.
- [ ] Headings say `Events` / `Methods`; columns say `| Name | Type | Description |`.
- [ ] No empty `Events` / `Methods` sections.
- [ ] Nothing outside the API tables was changed.
