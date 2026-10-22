# Pitfalls

Known issues and lessons learned during development.

## When to add an entry

Only when the lesson transfers. An entry earns its place when the same class of problem can reach
**other** files, components or features — a shared API, a browser behaviour, a pattern several call
sites are going to repeat.

Skip anything confined to one file, component or feature and hit once: the fix is already in the
code, and the entry only grows this list. That kind of one-off belongs in the commit message or in
a comment beside the fix.

## Format

### {Problem title}

- **Symptom**: What went wrong
- **Cause**: Why it happened
- **Fix**: How to resolve it

---

## Entries

<!-- Add new entries below this line -->

### `animation-fill-mode: both` pins animated values and pins a stacking context with them

- **Symptom**: A page of one-shot entry animations (PReveal, 16 instances) ran fine on load but stayed sluggish while scrolling — the compositor never reclaimed the layers. Dropping `forwards` fixed it with no visible behaviour change.
- **Cause**: Per CSSOM, an element that animated a stacking-context property (`opacity`, `transform`, `filter`) through `@keyframes` **keeps that stacking context when `fill-mode` includes `forwards`**. Holding the *start* frame needs only `backwards`, so `both` bought a permanent context per instance for free — the browser can no longer merge those layers, and every scroll frame re-composites them. `backwards` only covers the delay / before phase, which is the whole reason the paused state was written as `animation-play-state: paused` + `fill-mode` in the first place.
- **Fix**: Declare `animation-fill-mode: backwards`, never `both`, when no end state needs pinning. The implicit `to` frame already resolves to the element's own value, so nothing has to be pinned after the animation ends.
- **Related**: the same rule makes `will-change` on a long-lived selector a liability rather than a hint — the repo's `.pxd-transition--fade-*-active` classes carry `will-change` only because Vue removes them when the transition ends.

### A missing observer API must degrade to the visible state, never to an invisible one

- **Symptom**: An element that fades in on scroll stayed at `opacity: 0` forever when `IntersectionObserver` was unavailable — server rendering, or a browser without the API. Nothing threw; the content was simply gone.
- **Cause**: `useIntersectionObserver`'s pooled spec returns `undefined` from `create()` when the API is missing, so no observer is acquired and the callback that would clear the paused state never runs. The paused state came from CSS (`animation-play-state: paused` + a fill mode holding the `from` frame), which applies during SSR and hydration just as it does on the client.
- **Fix**: Arm the gating only once an observer instance actually exists (`const gated = computed(() => trigger === 'viewport' && !!observer.value)`) and leave the element running otherwise.
- **Testing note**: `vi.stubGlobal('IntersectionObserver', undefined)` reproduces it — `createObserver` checks `typeof globalThis.IntersectionObserver === 'undefined'`. The stubbed global must be restored afterwards, since the pool is module state that outlives the test.

### Non-pooled observers are never disconnected, so a target keeps waking dead scopes

- **Symptom**: Unmounting a component that called `useMutationObserver` leaves its observer running — callbacks reach a disposed scope — and every mount/unmount cycle adds another permanent one. `useMotionReduced` inherited it once per caller, each instance also repeating the same root `getComputedStyle` read per mutation batch.
- **Cause**: In `src/utils/observer.ts`, `cleanup()` reached `disconnect()` only inside `if (pool)`. `pool` is assigned solely for pooled specs, and mutation observers cannot be pooled, so their instances were released by clearing the ref and never stopped. Clearing the ref is not enough: the DOM keeps an observer alive for as long as the node it observes is reachable.
- **Fix**: Branch inside `cleanup()` — `observer.value?.disconnect()` when `pool` is unset. Never disconnect unconditionally: for a pooled spec `observer.value` is the *shared* instance, and stopping it while `count > 0` silences every remaining subscriber.
- **Testing note**: `vi.spyOn(MutationObserver.prototype, 'disconnect')` with `stop()` from `runWithScope` pins it. happy-dom delivers neither callback, so "no further callbacks arrive" cannot be asserted directly.

### Per-caller shared state belongs in the module, not in a scope

- **Symptom**: One `<html>` attribute change made every subscriber repeat the same forced style recalc; on Vue 2.7 / 3.3 each one also re-rendered although the value never changed.
- **Cause**: N subscribers each owned a copy of the derived state. Vue 3.4 compares a computed's old and new value before triggering, but 2.7 and 3.3 trigger on any recompute, so moving the value into a ref that nothing owns is not enough — the recompute itself has to be deduplicated.
- **Fix**: `useMotionReduced` keeps one module-level `MutationObserver` behind a subscriber count, held only while someone listens, and assigns the new value through a shared `shallowRef`: assigning an unchanged value already skips the notify step, so subscribers never wake for the mutations that do not reach `--duration`. The cost stays at one read per batch regardless of subscriber count.

### A resize observer is a proxy for content change, and a blind one inside a scrolled container

- **Symptom**: PToc's outline goes stale — headings that arrive late are never listed — while the `ResizeObserver` on `document.body` that is meant to notice looks like it fires.
- **Cause**: The body box moves on reflows that cannot change an outline (fonts, images), and never moves when content grows inside a height-capped scroll container (a `height: 400px; overflow: auto` pane stayed 402px while its `scrollHeight` went 24 -> 2024). The scroll element is no better: with `html { height: 100% }` its box is pinned to the viewport (484 against a `scrollHeight` of 2416), and a viewport resize fires it in neither case.
- **Fix**: Observe what the reader reads. `readOutline` derives entries from element identity, text and `id` alone, so PToc watches through `useMutationObserver` (`childList`, `subtree`, `characterData`, `attributeFilter: ['id']`) scoped to `scrollTarget ?? document.body`, and `useScrollspy` binds a `resize` listener whenever the scroll listener is `window`.
- **Testing note**: happy-dom delivers neither callback; `tests/helpers/setup.ts` mocks both constructors (`installResizeObserverMock` / `installMutationObserverMock`) and `fireAll()` replays the recorded targets. A synthesized record resolves through `ObserverSpec.resolveTarget` when its `target` is the observed element — the non-pooled path looks descendants up with `contains`, which is why mutation observers must not be pooled. Replacing `scrollHeight` / `scrollTop` with getters is not a way around it either: the mocks cannot re-measure a replaced property, so drive scroll state with a local `scrollTo` mock plus synthetic `scroll` events and assert the follow path through a deterministic public API (`stickIfNeeded` / `forceStickToBottom`) rather than through an observer.

### Per-frame DOM measurement inside a pointer handler

- **Symptom**: Dragging or scrolling a long list stutters hard, with `getBoundingClientRect` dominating the profile and cost growing with rendered rows instead of staying flat.
- **Cause**: `getBoundingClientRect` forces synchronous layout, and a hit test that walks every row pays that flush per row per event. At 8000 rows: 8001 forced reads for one `pointermove`, against 1 for a pointer near the top.
- **Fix**: Measure once into a cache keyed to something that survives the event, then do arithmetic. `rect.top + container.scrollTop` is scroll-invariant, so only a changed row count or a changed `data-index` at the window start invalidates it. Re-measure with a counter rather than trusting the shape of the loop.

### happy-dom renders zero rows for a virtual list

- **Symptom**: A `useVirtualList` component mounts with the correct `totalSize` style and an empty content box; `findAll()` for the row selector returns 0, so every "fewer than N rows" assertion passes regardless.
- **Cause**: happy-dom's `getBoundingClientRect` returns zeroes and cannot be overridden from the prototype chain, so `scrollRect` stays `{ width: 0, height: 0 }` and `getVirtualItems()` returns an empty window. Injecting rects per element (`stubRows` in `tests/components/tree.test.ts`) only covers elements the test already holds.
- **Fix**: Treat virtualization as unverified here: assert the spacer height and the option wiring, not row counts. A real assertion about the window needs a browser-mode run.

### Flat row lists must not depend on volatile per-row state

- **Symptom**: Every selection click costs time proportional to the whole visible list, even though two rows changed.
- **Cause**: `checked` / `indeterminate` lived per row, so a selection change rebuilt every row object. Keeping them out gives rows a stable identity, but that was not the cost: at 5000 rows the rebuild was 0.89 ms of a 157 ms click — 87% was the template render walking the visible rows.
- **Fix**: Keep volatile state out of the row object and read it at render time, and budget for the parent still re-rendering every visible row: this pays off only under `virtual`, and `derive()` stays O(total) regardless. Measure the split before promising a speedup.

### Property access cannot reach a kebab-case slot name

- **Symptom**: `<slot name="item-content">` never renders even though the consumer passes it, while a sibling `<slot name="header">` works; the component silently falls back to its default markup.
- **Cause**: `useSlots()` returns the raw slot map, so `slots.itemContent` looks up `itemContent` and never matches `item-content`; the compiler does not normalise the two spellings.
- **Fix**: Look the slot up by its exact name — `slots['item-content']` — hoisted into a `computed` boolean the template branches on.

### Volar error cache shows deleted identifiers

- **Symptom**: After removing an unused variable from an SFC, the Problems panel still reports it at the old line while grep shows it is gone.
- **Cause**: Volar keeps a stale diagnostics snapshot when the file is edited by an external process (several edit tool calls in one session).
- **Fix**: Trust `pnpm check:type` and `pnpm test`; re-open or reindex the file to clear the entry.

### Collapse `v-show` hides content from Find in page

- **Symptom**: Find in page cannot match text inside a collapsed PCollapse panel, and unlike native `<details>` the panel does not auto-expand on a match.
- **Cause**: `v-show` sets `display: none` and Find in page skips that subtree. `hidden="until-found"` is the HTML primitive for it, but Vue 2.7 / 3.2 coerce `hidden` to a boolean attribute, so the string cannot be bound reliably.
- **Fix**: Use native `<details>`/`<summary>`. Keep `open` true during the leave height animation, then remove it; skip enter motion when `toggle` opens the element without a click (find / fragment navigation).

### Scheduled shallowRef refresh misses in-place prop mutations

- **Symptom**: A heavy computed result moved to `shallowRef` stops updating when callers mutate array/object props in place.
- **Cause**: Watching the raw prop reference only tracks replacement, while the original computed chain tracked nested reads made while building derived data.
- **Fix**: Watch the computed dependencies that still read the prop contents, then schedule the heavy `shallowRef` refresh from those dependencies.

### RAF throttling does not isolate synchronous consumer work

- **Symptom**: A continuously controlled component still drops frames after pointer updates are throttled with `requestAnimationFrame`.
- **Cause**: Each frame synchronously emits both the live model update and the committed change event, so consumer listeners remain in the rendering hot path.
- **Fix**: Emit only `update:modelValue` during interaction, then synchronously process the final pointer position and emit `change` once when the interaction commits.

### Slot children may be wrapped in Fragments

- **Symptom**: Reordering top-level slot VNodes does not reorder items rendered by a template `v-for`.
- **Cause**: Vue can wrap the generated VNodes in a `Fragment`, leaving only one top-level slot child.
- **Fix**: Recursively flatten `Fragment` children at the owning slot boundary before applying order-dependent behavior.

### Deep selectors require scoped styles

- **Symptom**: A parent state class updates, but descendant component layout rules never take effect.
- **Cause**: Vue's `:deep()` transform only applies to scoped style blocks; in a regular `<style>` block the browser receives an unsupported selector.
- **Fix**: Use ordinary descendant selectors in global component styles, or add `scoped` when the rules require `:deep()`. The library itself uses no scoped styles.

### Forwarding slots in v-for re-renders every child on each parent update

- **Symptom**: Selecting a date in PCalendar re-rendered all 42 day cells per click while only 2 changed in the DOM.
- **Cause**: `patchFlag & 1024` (`DYNAMIC_SLOTS`) makes `shouldUpdateComponent` return `true` unconditionally, and forwarded slot children (`_: 3`) get that flag whenever the owning component's own slots are unstable.
- **Fix**: Do not forward user slots inside `v-for` children — render the child without slot children when the user slot is absent (`v-if="$slots.default"` branch plus a slot-less `v-else`), so unchanged cells skip via the props path. `v-memo` would also fix it but is Vue 3-only and breaks Vue 2.7 compat; setting `useSlots()._ = 1` works but rides on undocumented SlotFlags.
- **Related**: the props path fails the same way when a rebuilt object prop gives the child a new identity — `shouldUpdateComponent` compares prop *values*, so pass the fields that matter instead of the whole row object. Count renders by `instance.subTree` identity: `instance.vnode` is replaced on the skip path too and cannot tell the two apart.

### Vue test warnings: unresolved components and reactive component props

- **Symptom**: `pnpm test` prints `[Vue warn]: Failed to resolve component: PSpinner` / `RouterLink` even when the `v-if` branch rendering them is never taken; and `Vue received a Component that was made a reactive object` when a test passes a component object (`icon`, `separatorIcon`) through mount props.
- **Cause**: Two mechanisms. `resolveComponent()` calls hoist out of `v-if` at compile time, so the lookup warns on every render. And Vue Test Utils' `baseMount` stores props in `Vue.reactive({})` so `setProps` re-renders, deep-wrapping component objects in proxies — which `createVNode` flags as a performance hazard.
- **Fix**: Import library sub-components in the SFC (`import PSpinner from '../spinner/index.vue'`), stub host-provided ones (`RouterLink: RouterLinkStub` in `global.stubs`), and pass component objects as `markRaw(Component)` in mount props — matching what consumers should do when storing components in reactive state.

### happy-dom drops `color-mix` declarations, and `wrapper.vm` is typed from props only

- **Symptom**: Asserting `wrapper.attributes('style')` for PShimmerText's `backgroundImage` returns only the custom-property declarations, and numeric ones lose their unit (`--xs: 196;`). Casting `wrapper.vm.shimmerStyle` instead fails type-check with TS2339.
- **Cause**: happy-dom's CSS parser silently drops values it cannot parse (`color-mix(in oklab, ...)`), and custom properties always serialize as raw strings, so Vue never appends `px`. Separately, vue-tsc types `wrapper.vm` from props/emits only — `<script setup>` bindings exist on the render proxy at runtime but not on the public instance type.
- **Fix**: Assert through the vm with a cast — `expect((wrapper.vm as any).shimmerStyle.backgroundImage).toContain('#F5EBD9')` — or `defineExpose` the state when it should be public API. For numeric custom properties, assert the unitless form.

### Optional modelValue unions that include boolean default to false

- **Symptom**: Multi-select `v-model` starts as `[false, selectedValue]` instead of `[selectedValue]` when the parent omitted `modelValue` or passed `undefined`.
- **Cause**: Vue infers a `Boolean` runtime prop whenever the TypeScript union contains `boolean`. An omitted Boolean prop is cast to `false`, and `toArray(false)` becomes `[false]`.
- **Fix**: Keep `modelValue` typed as `string | number | (string | number)[] | null` (no `boolean`) unless a real boolean value is required. When aggregating multiple values, treat only `string`/`number` scalars and arrays as selections—not `false`.

### `cn` drops custom `text-*` utilities from variant class lists

- **Symptom**: A utility such as `text-trim-both` vanishes from the DOM when the same element also carries a font-size class built through `createTailwindVariant`, while it survives in a plain static `class` attribute.
- **Cause**: `cn` merges with tailwind-merge, which groups every `text-*` utility it recognises. An unknown/custom `text-*` class in the base is treated as a conflicting member of that group and is removed when a later `text-*` class (e.g. `text-xs`, or a colour variant) is appended.
- **Fix**: Register custom font-size scales in the `font-size` class group of `src/utils/cn.ts`; otherwise keep a custom `text-*` utility out of a variant base when the variants themselves add `text-*` classes, or wrap it in a non-`text-*` form (e.g. an `[@media]`/arbitrary variant or a dedicated CSS rule). Static class attributes are unaffected because they never pass through `cn`.

### KeepAlive only caches stateful component vnodes

- **Symptom**: `keep-alive` looks wired up but switching away and back resets the panel state anyway.
- **Cause**: `<KeepAlive><Component :is="slotFn" /></KeepAlive>` makes the child a function component (shapeFlag `FUNCTIONAL_COMPONENT`), and KeepAlive's cache branch only accepts `STATEFUL_COMPONENT` (`shapeFlag & 4`) or suspense (`& 128`) children. Everything else falls through `current = null; return rawVNode` and is re-created on every activation. A bare function is also not a valid component type on Vue 2.7 — `h(slotFn)` renders an empty comment.
- **Fix**: Put a real component in between. `src/components/tabs/tab-slot.ts` renders slot content inside `defineComponent`; KeepAlive then caches it, and the same wrapper keeps the Vue 2.7 path working. Never hand a slot function to `<component :is>`.

### Self-registering children never reach the first render pass

- **Symptom**: A container whose header is built from registered children renders an empty header during SSR and on the first client frame; items appear only after mount.
- **Cause**: A child registers in its `setup`, which runs while the parent's subtree is being patched — after the parent's render already read the empty registry. SSR never re-renders, so the markup is absent from the HTML.
- **Fix**: Take a data prop (`options`) and render from it. PResizable was the last holdout: its registry only ever read the element to run `compareDocumentPosition`, and the order came from the array it was about to render anyway — registering an element purely to sort it is not measuring it. `useOrderedChildren`, `contexts/resizable.ts`, `PResizablePanel` and `PResizableHandle` went with it.

### Isolating repeated slot content behind a wrapper component does not pay for itself

- **Symptom**: Every row/slide re-renders whenever the container re-renders — hovering one row of a 200-row PList invoked the `item` slot 40200 times per sweep.
- **Cause**: Children declared in a `v-for` with slot content get `DYNAMIC_SLOTS`, so `shouldUpdateComponent` returns `true` for all of them. The content is *not* the shared-render-effect problem it looks like: a scoped slot function is invoked by the child that renders it, so reactive reads inside it already land in that child's effect.
- **Tried**: A stateful wrapper taking the slot function as a `render` prop plus stable scope props (`PCarouselItemSlot` / `PListItemSlot`). It does skip unchanged content — counters prove the wrappers rendered once while the container re-rendered hundreds of times — but it is slower: PList 200-row hover sweep 1.38s -> 1.70s; PCarousel 20 slides x 200 swipe frames 23.0ms -> 57.6ms.
- **Fix**: Keep the inline `<slot>`; rebuilding a row/slide vnode tree is cheaper than the per-item component vnode + `shouldUpdateComponent` path the wrapper adds to every container render. Both wrappers were measured and reverted.

### Roving tabindex without a key handler locks keyboard users out

- **Symptom**: Only the selected tab is reachable with the Tab key, and arrow keys do nothing.
- **Cause**: `:tabindex="active ? 0 : -1"` implements half of the APG tabs pattern; the arrow/Home/End handler is the other half. Without it the inactive tabs are unreachable.
- **Fix**: Drive the handler from `useListNavigation` + `useListKeyboardController`, keep the navigation index in sync with the active value, and move focus with `scrollToIndex` so the selected tab stays visible.

### `git checkout-index -f -a` skips files that only differ in line endings

- **Symptom**: `pnpm fmt:eol` rewrote `src/` files but left `.md` and other documents on CRLF.
- **Cause**: With `* text=auto eol=lf` in `.gitattributes`, a CRLF working copy is *content identical* to the LF blob, so git treats such a file as up to date and skips it even with `-f`.
- **Fix**: `scripts/fmt-eol.js` rewrites the tracked files directly. Rewriting invalidates the index stat entry, which makes `git status` report the file as modified although the blob is unchanged, so the script re-adds the rewritten files whose bytes still match the blob — `git update-index --refresh` does not clear this.

### Per-gesture recognizer state must be reset by the terminal handler

- **Symptom**: In a pointer recognizer, a tap is treated as vetoed after the previous gesture was vetoed — the next tap silently stops working.
- **Cause**: Per-gesture state (`startVerdict`, the start gate, axis lock) was initialised in the `onStart` callback, which only fires once movement passes `swipeThreshold`. A tap never reaches `onStart`, so it reads whatever the *previous* gesture left behind.
- **Fix**: Clear the state in whichever handler ends the interaction (`onEnd`, `onTap`/`onIdle`, `onCancel`) instead of at the start of the next one. If a terminal handler must await something before it can classify the gesture, capture what it needs in locals first — the deferred callback must not read fields that have already been reset.
- **Testing note**: a hand-built drag that presses and releases at the same `clientY` never crosses the drag threshold, so it reads as ignored — move between the two events.

### ARIA role states are gated on interactivity, not just whitelisted

- **Symptom**: A pointer-only splitter carried `aria-valuenow` / `aria-valuemin` / `aria-valuemax` / `aria-expanded`, none of which the accessibility tree may expose.
- **Cause**: `aria-expanded` is not a `separator` state at all — it marks control over *visibility*, which folding a panel never does. The `aria-value*` trio is listed for `separator` only while the element is focusable *and* its value is known, so dropping `tabindex` and the key handler silently voided all four.
- **Fix**: A splitter is binary — either a focusable separator (`tabindex="0"`, the value properties and a key handler arrive together) or a non-focusable structural divider carrying only `aria-orientation`, `aria-controls` and `aria-disabled`. Extra state goes in `aria-valuetext`, the role's only free-form field. Read a role's *conditional* wording before adding its states; the supported-state list is not the whole rule.

### The docs dev server scaffold overwrites a newly created component page

- **Symptom**: A freshly written `packages/docs/src/pages/components/<name>.md` reverts to a one-section stub ("New component description.") shortly after being saved.
- **Cause**: `packages/docs/scripts/vite-plugin-file-create-watcher.ts` hooks `watcher.on('add')` on `src/components` while the docs dev server is running. Creating the component's `index.vue` makes it run `update-exports` and then unconditionally `writeFileSync` a scaffold page over `<name>.md` — including one that already has full content.
- **Fix**: Create `index.vue` first, let the scaffold write the page, then write the real docs content afterwards (the watcher only fires on `add`, not `change`). Same applies to composable pages for new `src/composables/*.ts` files.

### A PPopover wrapper must not derive its `model-value` from a fallback getter

- **Symptom**: A component wrapping `PPopover` opens from the trigger but its own close command does nothing — the popover stays on screen while the component reports `update:modelValue` as `false` and runs the confirmed action anyway.
- **Cause**: The popover's rendered truth is the internal `useDelayDestroy` `visible` ref it seeds once from the prop, so the prop is an imperative command: only a *change* in `props.modelValue` reaches `handlePopoverShow` / `handlePopoverHide` through the `watch`. A wrapper that feeds `:model-value="props.modelValue ?? localVisible"` freezes that value whenever the parent supplied one, so writing `localVisible` never produces a change the popover can observe.
- **Fix**: Make a local ref the only source passed down (`localVisible = shallowRef(props.modelValue ?? false)`), let `watch(() => props.modelValue)` merely mirror the parent into it, and have close/set paths write the ref plus `emits('update:modelValue')`. Every open and close then reaches the popover as a real prop change.
- **Testing note**: Assert DOM state (`data-visible` on `.pxd-popover--wrapper`), not just `emitted('update:modelValue')` — an event can fire while the popover stays open.

### A menu keymap steals characters from a search input

- **Symptom**: Typing in the filter input above a `PList` selects an option instead — a space picks the active row mid-word.
- **Cause**: `useListKeyboardController` keymaps written for menus map `' '` to `activate`, and the handler is bound where the menu would own focus. Once an input owns focus, every printable key must reach it.
- **Fix**: Give the searchable variant its own keymap without `' '` and bind the handler to the input's `keydown` (it bubbles to the popover wrapper anyway, which still covers the non-searchable case). Focus the input on open, or set `auto-focus-element` so the focus trap targets it — a manual `focus()` can otherwise be undone by the trap's `initialFocus`.
- **Related**: `MentionFilterMethod` aside, `useListFilter` is synchronous; a remote filter needs the request-id guarding in `use-mention-suggest.ts`.

### Selected labels must resolve from the full options, not the filtered ones

- **Symptom**: The trigger of a filterable select goes blank as soon as the search text excludes the current selection — the value is still set, only its label disappears.
- **Cause**: Resolving the label from the list's current `options` makes it a function of the filter; an option the query drops has no row to resolve against.
- **Fix**: Resolve from the unfiltered source (`useSelectedListItems(() => props.options || [], modelValue)`) and pass the filtered array to `PList` only.

### A component that reads the clock in `setup` needs the clock frozen in its tests

- **Symptom**: Two `PTimeAgo` cases failed by exactly one unit — `'in 3 hours'` came back as `'in 2 hours'`, `'5 seconds ago'` as `'6 seconds ago'` — and both read like an off-by-one inside the component.
- **Cause**: Two mechanisms, one per case. The component captures `now` in `setup`, which runs a fraction of a millisecond after the test evaluated `Date.now() + 3 * HOUR`; the difference is therefore *just under* three hours, and `Math.floor(abs / HOUR)` floors it to two (a past value adds that same fraction, which is why only the future case failed). Separately, Vitest's fake clock *is* `Date`: `vi.advanceTimersByTime` advances the very time `vi.setSystemTime` sets, so setting `T + 5s` and then advancing one second makes the interval callback read `T + 6s`.
- **Fix**: Freeze the clock (`vi.useFakeTimers()` + `vi.setSystemTime`) whenever an assertion sits on a bucket boundary, so the test and the component read the identical instant. To drive an interval, only advance it — `advanceTimersByTime(5 * SECOND)` fires it five times and lands on five seconds; never `setSystemTime` beforehand. Restore with `vi.useRealTimers()` in `afterEach`.

### A delay derived from data must be clamped before it reaches `setTimeout`

- **Symptom**: Scheduling an update for the moment a label changes fires in a tight loop and pins a CPU core. A 400-day-old `PTimeAgo` asks for a 330-day delay; nothing throws, the page simply never idles.
- **Cause**: The delay is coerced to a 32-bit signed integer. Node warns and substitutes 1 ms (`TimeoutOverflowWarning: 3000000000 does not fit into a 32-bit signed integer`, and the same for `TimeoutNaNWarning`), browsers follow the spec and set it to 0. Either way the callback runs at once and reschedules the same delay. `NaN` arrives through the same door: an unparseable date makes the age `NaN`, and `Math.max` / `Math.min` carry it into the delay.
- **Fix**: Hold every delay below the 32-bit limit — clamp it, or simply refuse to schedule one that is longer than the behaviour is worth (`PTimeAgo` stops at a day) — and never schedule a non-finite one (`Number.isFinite(delay)`). A constant delay such as a fixed 60 s interval cannot reach this; only a delay computed from the data can.
- **Testing note**: Assert through `vi.spyOn(globalThis, 'setTimeout')` and check the delay argument. Rendered output cannot expose a broken clamp, because the failure mode is a hang rather than a wrong value.

### A vertical drag is the same gesture as a vertical scroll, and only a hold can tell them apart

- **Symptom**: Dragging a node on touch scrolls the page instead; the drag dies with a `pointercancel` before it starts. With a mouse the drop indicator stays on the row that was under the pointer *before* anything scrolled, so the node lands a scroll away from where it was released.
- **Cause**: Two mechanisms. A pointer drag down a list is the same gesture as panning it, and `touch-action` is read when the pointer goes down, so swapping it mid-gesture is too late — the browser owns the gesture and the drag only sees the cancellation. Separately, cached row rects are content offsets that survive scrolling on purpose, but the origin they are read against is a *snapshot* of `containerRect.top - scrollTop`; it goes stale on the first scroll of the list, the page or a wheel.
- **Fix**: Gate touch and pen behind a hold (300ms in `use-tree.ts`) and let a move inside that window cancel the arming — the browser is already panning. Once the hold passes, a non-passive `touchmove` that calls `preventDefault()` is enough to stop the scroll, because a finger that has not moved yet has not started one; register it only after the hold, or every touch pays for a blocking listener. Refresh the origin and re-resolve the target on every scroll (a `scroll` listener on the container and on `window`), since the wheel can move the rows under a pointer that never moved.
- **Do not auto-scroll a drag you do not own**: two attempts at edge auto-scroll — first walking outwards through the page, then scoped to the dragged list — were both removed in favour of letting the browser scroll. A pointer drag has to fight the browser for the gesture, and every edge test reads a box that some scroll can move; the trees that ship no scrolling code (antd/rc-tree, Element Plus) get away with it because native HTML5 DnD hands the gesture to the browser. Following the scroll is all a drag needs: a `scroll` listener on the container and on `window` that refreshes the origin and re-resolves the target.
- **Related**: `setPointerCapture` on the scroll container keeps `pointerup` arriving when the drag is released outside the window; release it behind a `hasPointerCapture` check, which returns false where `releasePointerCapture` throws.

### A repeat interaction with an open popover emits no `show`

- **Symptom**: A wrapper that restarts its auto-close countdown on the popover's `show` event resets nothing when the same trigger is clicked again — and with `toggleOnTrigger` left at its default, that second click closes the popover instead.
- **Cause**: `show` / `visible-change` fire only on a real visibility change, so re-activating the already active trigger goes through `updateActiveTrigger` and stays silent; the interaction itself surfaces as `trigger-click`, which `activateTrigger(trigger, toggleOnTrigger)` emits before it decides between hide, reposition and open.
- **Fix**: Restart the timer on `trigger-click` and pass `:toggle-on-trigger="false"` (`PHint`, `src/components/hint/index.vue`), so a repeated interaction keeps the rendered element and only resets the deadline.
- **Related**: A wrapper also cannot reach the popover's own wrapper element to pause on hover — `PPopover` renders it internally and teleports it to `body`. Bind those listeners on the root element the wrapper renders inside the `content` slot.

### A drag ends with a click the browser makes on its own

- **Symptom**: Releasing a drag back on the row it started from toggles that row — it gets selected, checked or expanded, none of which the user asked for.
- **Cause**: The browser dispatches a `click` after `pointerup` whenever both share an ancestor, and a drag that returns to its starting row does exactly that. A drag crossing into another row sends the click to the common ancestor instead, which is why only the same-row case misbehaves.
- **Fix**: Keep a flag for the gesture that actually moved something, clear it on the next `pointerdown`, and ignore clicks while it is set (`didDrag()` in `use-tree.ts`, checked by the tree's click handlers). Clearing it at the end of the gesture is not enough: the click arrives after the drop has already been committed and the session reset.

### A promise prop must not be the return value of a watcher getter

- **Symptom**: `watch(() => props.promise, subscribe, { immediate: true })` works until the promise rejects — then Vue logs `Unhandled error during execution of watcher getter` and the rejection surfaces again as an unhandled promise, in tests as Vitest's "Unhandled Errors" (`PHint`, `src/components/hint/index.vue`).
- **Cause**: `watch` with a getter runs it through `callWithAsyncErrorHandling`, which attaches `res.catch(err => handleError(err, instance, WATCH_GETTER))` to any promise the getter *returns*. The getter returns the `promise` prop itself, so the rejection is reported as a component error, and in dev `handleError` rethrows it into a promise nothing observes. One rejection a consumer already handles thus produces both a Vue warning and an unhandled rejection.
- **Fix**: Subscribe from `watchEffect` (its callback goes through `callWithErrorHandling`, which ignores return values), or make the getter return a wrapper such as `() => [props.promise]`. Attaching the handler in `setup` directly is also unaffected — only the returned value path is.

### A virtualizer scroll command issued at mount resolves to nothing

- **Symptom**: `scrollToIndex()` (or `scrollToOffset()`) called from a `useVirtualList` consumer's `onMounted` does nothing at all, while the identical call from a keyboard or pointer handler works — `PList` scrolling to the first selected option is the case that surfaced it.
- **Cause**: `new Virtualizer({ count: 0 })` gets its real count only from `useVirtualList`'s own `onMounted`/watcher, so no render has read `getVirtualItems()` yet when the consumer's hook runs. `getOffsetForIndex` reads `this.measurementsCache[index]` directly (not through `getMeasurements()`), gets `undefined` and `scrollToIndex` returns early — it never reaches `scrollToFn`, so the reconcile loop cannot recover either. The spacer height is still `0px` in that tick as well, which would clamp the offset to 0 via `getMaxScrollOffset()`.
- **Fix**: Defer the command by one tick, so the re-render pushes the count, the measurements and the content height before the offset is computed (`scrollToFirstSelected` in `src/components/list/index.vue`). Any `useVirtualList` consumer scrolling on mount needs the same `nextTick` — `tree`, `virtual-list` and `bubble` reach `scrollToIndex` from handlers only today.

### POverlay locks the root, so slotted content must re-enable pointer events

- **Symptom**: An overlay panel built on `POverlay` renders correctly but ignores every click; only Escape still closes it.
- **Cause**: `useOverlayManager` puts `pointer-events: none` on `<html>` while an overlay is open, and `pointer-events` is inherited. `POverlay` re-enables it only on its own mask, not on the slotted panel. Its `z-index` prop likewise styles the mask, not the slot.
- **Fix**: Give the teleported panel `pointer-events-auto` and its own stacking value — `calc(var(--modal-index) + 5)` by default, overridable through a local variable when a `zIndex` prop is set (`PImagePreview`).

### `whitespace-pre` content leaks its intrinsic width into the ancestor layout

- **Symptom**: `PToolCall` widened its own container (and the surrounding chat column) whenever a payload line was long, instead of scrolling inside the payload box.
- **Cause**: `overflow-x: auto` + `max-w-full` clamp the *used* width only. While an ancestor measures intrinsic width — a flex item's automatic minimum size, a grid `1fr`/`auto` track, `fit-content` — the percentage `max-width` resolves as `none`, so the `<pre>`'s min/max-content width is the width of its longest unbroken line and propagates up the whole chain.
- **Fix**: Give the scroll box `w-0 min-w-full` (`width: 0` makes the intrinsic contribution 0; `min-width: 100%` restores the full container width at layout time), so the payload scrolls and nothing above it grows.

### A drag must not accumulate from the value it clamped

- **Symptom**: A splitter stops at its minimum width and the rest of the gesture is swallowed — continuing left never folds the panel, and the caller has to fake a negative minimum to keep the pointer alive.
- **Cause**: The pointer delta was applied to the *rendered* size, which had already been clamped to the bounds, so each frame started from the floor and the extra travel was discarded.
- **Fix**: Keep the pointer position as its own value in gesture space, apply deltas to that, and derive the render size (`max(pointer, min)`) from it. Fold detection compares the pointer, not the render size; the clamp belongs on the way out, never on the way in.

### A typed emit cannot take a union of event names

- **Symptom**: `vue-tsc` rejects `emits(event, payload)` where `event: 'add' | 'remove'`, complaining that `Argument of type '"add" | "remove"' is not assignable to parameter of type '"remove"'`.
- **Cause**: `defineEmits<T>()` turns every key into its own overload `(evt: K, ...args: T[K]) => void`. A union key has to satisfy all of them at once, so it collapses onto the last overload and the payload tuple of the other event no longer matches.
- **Fix**: Branch on the event name at the call site so each `emits()` receives a literal — `if (event === 'add') { emits('add', emoji) } else { emits('remove', emoji) }` (`src/components/reactions/index.vue`). Giving both events the same payload tuple also works, but it flattens the public API for the sake of one helper.
