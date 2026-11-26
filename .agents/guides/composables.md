# Composables

When logic belongs in a composable, where it lives, and what its interface must look like.

## Placement

| Location | Visibility | Use |
| --- | --- | --- |
| `src/composables/` | public: exported through the generated barrel, `./composables/*`, documented | headless behavior users may build their own view on |
| `src/composables/_internal/` | private to the library: never exported, never documented | a seam shared by several components, or a component's testable core |

Default to `_internal/`. A composable graduates to public only when the graduation checklist below
passes.

## Type placement

| Kind | Location |
| --- | --- |
| Generic design-system types (props, tokens, shared unions) | `src/types/shared/` |
| Types owned by a component domain but used by several components | `src/types/components/<name>.d.ts` |
| Types owned by a composable domain but used by several composables | `src/types/composables/<name>.d.ts` |

Import a shared type from its defining module. Never re-export it through a component's `types.d.ts`.

## Interface rules (MUST)

1. **Input is domain values, not the component's `props` object.**

   ```ts
   // good
   useCountdown({ duration: () => props.duration, onFinish: () => emits('finish') })

   // bad: the composable is now a copy of one component's prop surface
   useCountdown(props, emits)
   ```

   Every input that can change is `MaybeRefOrGetter<T>` and is read with `toValue`. Never read
   `props.x` inside a composable, and never type its signature with a component's `XxxProps`.

2. **A composable never emits.** Report outward through `onXxx` callbacks; the component maps them
   to its public events.

   ```ts
   const { reset } = useCountdown({
     onReset: () => emits('reset'),
   })
   ```

3. **No DOM protocol in the signature.** `rect` / `pointerId` / `scrollTop` / `clientX` parameters
   mean the seam is wrong. Extract the value or state layer; keep pointer capture, layout reads and
   browser protocols in the component, or in a dedicated `_internal` DOM composable
   (`use-swipe-gesture`).

   An element ref is not that protocol: `MaybeElementRef` is how a DOM-owning composable names its
   target (`useStickToBottom`, `useDetailsCollapse`, `useOutsideClick`), and a returned handler may
   take an `Event` when the module owns that native behaviour (`onDetailsToggle`,
   `onTrigger(ev: PointerEvent)`). What stays out of a public signature is the *value* layer —
   `rect`, `scrollTop`, `pointerId` — unless the module is `_internal`.

4. **No imports from `src/components/**`.** A composable that depends on a component's types is a
   component in disguise. Put the shared type under `src/types/` following the type placement table
   above, and import it from the defining module directly. Never re-export it through a component's
   `types.d.ts`.

5. **Small return surface.** Refs plus actions, few keys, nouns for state (`timestamp`, `value`) and
   verbs for actions (`reset`, `stop`, `toggle`). If the return object mirrors the internal state,
   the module is shallow.

6. **Own the cleanup.** Register `onScopeDispose`; never require the caller to remember `stop()`.

7. **Own the defaults.** A public composable must work when called with no options. Component-level
   defaults are a separate concern, see `components.md`.

## Before writing one

Answer all four. Any "no" means the logic stays in the component.

- [ ] Does it have a second consumer, or is it a deliberate public headless API?
- [ ] Can the interface be named in domain terms, without referring to "the component"?
- [ ] Is the behavior stateful, asynchronous or time-based enough to test without mounting?
- [ ] Deletion test: if the composable disappeared, would the complexity reappear in two or more
      places?

Do **not** create a composable for:

- one-off derived styles or `computed` class names;
- DOM geometry, pointer capture, scroll measurement, animation orchestration;
- a pass-through whose interface is the component's props;
- "consistency" with another component's file layout.

## Graduation checklist (`_internal` -> public)

- [ ] A deliberate decision to support it as public API.
- [ ] Domain-only signature: `MaybeRefOrGetter` inputs, `onXxx` callbacks, no `props` / `emits`.
- [ ] Tests in `tests/composables/<name>.test.ts`, at least one through `runWithScope()` without
      mounting a component.
- [ ] Docs page `packages/docs/src/pages/composables/<name>.md` with `## Exports`, `## Types` and
      `## Params`.
- [ ] Run `node scripts/update-exports.js` to regenerate `src/composables/index.ts`,
      `packages/docs/src/consts/composables.json` and `volar.d.ts`. It stages and commits the
      generated files itself.
- [ ] Breaking changes to an already-public composable are marked with `!` in the commit and noted
      in the changelog.

## Testing

- `runWithScope()` / `useSetupWrapper()` from `tests/helpers/setup.ts`.
- Fake `performance.now()` / `Date.now()` / timers where behavior is time-based, see
  `tests/composables/use-countdown.test.ts`.
- Assert through the returned interface, not internals. DOM, accessibility and emitted events stay
  the component tests' job.

## Audit snapshot (2026-11-14)

Re-run with:

```powershell
Get-ChildItem -Recurse src/composables -Filter *.ts | Select-String -Pattern 'emits:|EmitFn|props:'
```

No public composable takes `props` or `emits`, and no composable imports a component's types. One
`_internal` exception remains:

| Composables | Coupling | Why it is allowed |
| --- | --- | --- |
| `_internal/use-model-value.ts` | `props` / `emits` | adapting controlled/uncontrolled prop semantics is its whole job |

Measurement is allowed when the behaviour is the product, not decoration: `useStickToBottom` reads
scroll geometry, `useDetailsCollapse` reads `transition-duration` and waits for `transitionend`.
The roadmap's injected-`transition` rule targets components whose animation the consumer decides;
applying it here would push the two-pass enter — commit `open`, then flip the row — onto every
caller, so `useDetailsCollapse` keeps the measurement.

The remaining priority queue and the component triage live in `.agents/plans/composables-roadmap.md`.