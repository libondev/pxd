# Patterns

Reusable code patterns and examples discovered during development.

## Format

### {Pattern name}

- **Use case**: When to use this pattern
- **Example**: Code snippet

---

## Entries

<!-- Add new entries below this line -->

### Bisecting a monotonic list instead of caching offsets

- **Use case**: Locating a position in a list of elements whose layout offsets rise monotonically (document-order scroll targets) on a per-frame path, where a cached offset table could not be invalidated.
- **Example**: `useScrollspy` bisects `getBoundingClientRect().top` against the probe line — `log n` layout reads per pass instead of one per target. Taking every read fresh is what lets content growing inside a scrolled container stay correct with no invalidation hook: a cached `offsetTop` table cannot do it, because `ResizeObserver` cannot see `scrollHeight` growth.

### Searchable collapse via native `details`

- **Use case**: An accordion that must animate height and still participate in Find in page / fragment navigation.
- **Example**: `useCollapseMotion(isExpanded)` — delay clearing `detailsOpen` until the leave height animation finishes; call `skipEnterMotion()` before expanding when the browser already opened `<details>` (find / fragment navigation).

### Per-app unique id via `$root` + WeakMap

- **Use case**: DOM `id`/`for` and registry keys that must be unique within an app, SSR-stable, and not forked by Vue 2.7 vs 3 APIs.
- **Example**: `getUniqueId` — count on `getCurrentInstance().proxy.$root` (exists on both 2.7 and 3); each `createApp` / `new Vue()` starts at 0. No `useId` / `appContext`.

### List selection session

- **Use case**: A popover or menu that updates `v-model` immediately but should only emit `change` when the interaction commits (menu close in multiple mode).
- **Example**: `List` owns toggle via `resolveNextListValue` and emits `update:modelValue` with the next value; `useListSelection.apply(next)` stores that value for the open session (no second toggle) and returns whether the overlay should close; `commit()` emits `change` only if multiple selection actually changed. Action menus leave `List` uncontrolled (`modelValue` unbound) so checkmarks never show.

### Shared pointer-gesture composable with an async start gate

- **Use case**: Several components need the same pointer plumbing — axis lock with a deadzone, pointer capture, window-level move/up/cancel, live signed displacement — but each decides differently what counts as a successful gesture (container size vs. a measured action width, flick velocity vs. travel ratio).
- **Example**: `useSwipeGesture` (`src/composables/_internal/use-swipe-gesture.ts`), consumed by `PCarousel`, `PDismissContainer` and `PSwipeCell`. The recognizer owns the mechanics and reports `onPress` / `onFollow` / `onRelease` / `onTap`; consumers supply only policy.
  - Keep the built-in decision optional. `swiped` and `direction` follow `distanceThreshold` / `velocityThreshold` against the container size, and `onRelease` additionally exposes `displacement`, `velocity`, `axisLocked` and the raw event so a consumer measuring something else (PSwipeCell compares against its measured prefix/suffix width) can decide for itself.
  - Gate the start instead of the gesture: `beforeStart` returning `boolean | Promise<boolean>`. Returning `false` discards the gesture — no `onFollow`, no `onRelease`, and the release surfaces through `onTap({ vetoed: true })`. A synchronous `boolean` verdict must short-circuit synchronously; only a thenable defers, so consumers without an async gate keep a fully synchronous pointerdown -> pointermove -> pointerup sequence. Movement arriving while the gate is pending is dropped, and a release inside that window waits for the verdict.
  - `axisLocked` is separate from `swiped`, because a cross-axis rejection and an unmoved tap both report `swiped: false` but must not be treated the same: the first is a cancelled swipe, the second is a tap.
  - `onTap` carries `startEvent` (the pointerdown) as well as the release event. Hit-test what the user pressed, not where the pointer happened to be released.

### Testing scroll-driven components with patched scroll metrics

- **Use case**: Components that read `scrollTop` / `scrollHeight` / `clientHeight` (Backtop, StickToBottom, ScrollProgress). happy-dom performs no layout, so these properties must be stubbed on the element under test.
- **Example**: `patchScrollMetrics(el, { scrollHeight, clientHeight, scrollTop })` defines the three properties as getters/setters over a plain metrics object. Mutate `metrics.scrollTop`, dispatch `new Event('scroll')`, then await one raf plus `nextTick` (`flushRaf`) because listeners are raf-throttled via `scheduleByRaf` / `throttleByRaf`.
