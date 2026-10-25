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
- **Example**: `List` owns toggle via `resolveNextListValue` and emits `update:model-value` with the next value; `useListSelection.apply(next)` stores that value for the open session (no second toggle) and returns whether the overlay should close; `commit()` emits `change` only if multiple selection actually changed. Action menus leave `List` uncontrolled (`modelValue` unbound) so checkmarks never show.

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

### Clock-derived text under SSR hydration

- **Use case**: Any component whose output depends on a clock, a random value or the device rather than on props alone — relative time, a time-of-day greeting. Its server-rendered text can never equal what the client computes on its first pass, so hydration always reports a mismatch.
- **Example**: Put `data-allow-mismatch="text"` on the element holding the value. Vue 3.5 reads it for a `text` / `children` mismatch, silences the warning, and leaves the correction in place — `el.textContent = vnode.children` runs either way. The prerendered text therefore survives as a no-JavaScript fallback and no warning is logged. Proven in `PTimeAgo` (`src/components/time-ago/index.vue`) by rendering with `renderToString` at one clock, hydrating at another, and asserting both the corrected text and the absence of a `Hydration` warning — set the attribute to an unrelated type and the warning returns, so the assertion is not vacuous. Two bounds: the attribute is inert on Vue 2.7, whose hydration has no such opt-out, and name only the mismatch type you mean (`text`, not `""` or `children`) so structural, class and style mismatches still warn.

### Keeping a scrolled-to row off the edge with `scrollPadding*`

- **Use case**: A virtual list that scrolls an item into view should not leave it flush against the edge it aligned to — a row in the last visible slot reads as the last row of the list.
- **Example**: Raise the virtualizer's `scrollPaddingStart` / `scrollPaddingEnd` by one row (`virtualOptions` in `src/components/list/index.vue`: `props.itemSize + 16`). Both are read only by `getOffsetForIndex`, where they set the visibility threshold and the alignment offset, so `scrollToIndex(index, { align: 'auto' })` — from keyboard navigation and from a mount-time scroll alike — keeps one row of space in both directions with no post-adjustment of the offset. The same knob does not exist for a hand-rolled `scrollIntoView({ block: 'nearest' })` path, which needs CSS `scroll-padding` instead (still 8px on `PList`'s non-virtual rows).

### Mount the overlay only once it has content

- **Use case**: A floating layer rendered once per list row (popover, confirm popover) pays the teleport cost while closed — one extra patch after mount plus a permanent anchor in `body`.
- **Example**: `PPopover` guards `<POverlay>` with `v-if="isRender"` instead of adding a "don't teleport yet" flag to `POverlay` / `PTeleport`. Closed rows mount neither the overlay nor its teleport; the opened instance pays the usual post-mount move once. A `defer` flag would have to be turned off exactly when content exists, and content outlives visibility during `destroyDelay` — a closed-triggered flag would move a still-visible leave transition back into its trigger's stacking context.

### DOM-less outline tracking over a virtualizer

- **Use case**: A toc/outline over a list that does not keep every entry in the DOM (virtual scrolling): enumeration, active tracking and jump-to all fail through `querySelectorAll` / `getBoundingClientRect` / `getElementById`.
- **Example**: `PToc` data mode — `data` carries the outline and `source` (`VirtualListScrollSource`, exported by `src/composables/use-virtual-list.ts`) answers positions. Active tracking bisects `getOffsetForIndex(i, 'start')` against `getScrollOffset()` instead of rects: the active entry sits at the probe line, where the owning list has it rendered and measured, so estimates further away only ever affect jump targets — and jumping goes through `virtualizer.scrollToIndex`, whose dynamic-size convergence is built in. The source is a plain object, but its getters read `triggerVersion` (the composable's returned `scrollSource`), so a consumer's `computed` calling them subscribes to scroll and measurement changes with no explicit `subscribe` plumbing — that reactive read is the contract, document it at the interface. Caveat found the hard way: `getOffsetForIndex` reads `measurementsCache`, which TanStack only rebuilds when someone calls `getMeasurements()` — normally the host render reading `getVirtualItems()`, and the rebuild fires no `onChange`, so there is no self-correcting bump. Call `virtualizer.getVirtualItems()` at the top of each source getter to refresh the cache lazily; otherwise a reader that runs before the list's next render pass (a computed in another component, or synchronous test code) sees `undefined`/stale offsets.
