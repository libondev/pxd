# Pitfalls

Known issues and lessons learned during development.

## Format

### {Problem title}

- **Symptom**: What went wrong
- **Cause**: Why it happened
- **Fix**: How to resolve it

---

## Entries

<!-- Add new entries below this line -->

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
- **Testing note**: happy-dom delivers neither callback; `tests/helpers/setup.ts` mocks both constructors (`installResizeObserverMock` / `installMutationObserverMock`) and `fireAll()` replays the recorded targets. A synthesized record resolves through `ObserverSpec.resolveTarget` when its `target` is the observed element — the non-pooled path looks descendants up with `contains`, which is why mutation observers must not be pooled.

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
- **Fix**: Trust `pnpm type-check` and `pnpm test`; re-open or reindex the file to clear the entry.

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

### Vue test warnings: unresolved components and reactive component props

- **Symptom**: `pnpm test` prints `[Vue warn]: Failed to resolve component: PSpinner` / `RouterLink` even when the `v-if` branch rendering them is never taken; and `Vue received a Component that was made a reactive object` when a test passes a component object (`icon`, `separatorIcon`) through mount props.
- **Cause**: Two mechanisms. `resolveComponent()` calls hoist out of `v-if` at compile time, so the lookup warns on every render. And Vue Test Utils' `baseMount` stores props in `Vue.reactive({})` so `setProps` re-renders, deep-wrapping component objects in proxies — which `createVNode` flags as a performance hazard.
- **Fix**: Import library sub-components in the SFC (`import PSpinner from '../spinner/index.vue'`), stub host-provided ones (`RouterLink: RouterLinkStub` in `global.stubs`), and pass component objects as `markRaw(Component)` in mount props — matching what consumers should do when storing components in reactive state.

### happy-dom drops `color-mix` declarations, and `wrapper.vm` is typed from props only

- **Symptom**: Asserting `wrapper.attributes('style')` for PShimmerText's `backgroundImage` returns only the custom-property declarations, and numeric ones lose their unit (`--xs: 196;`). Casting `wrapper.vm.shimmerStyle` instead fails type-check with TS2339.
- **Cause**: happy-dom's CSS parser silently drops values it cannot parse (`color-mix(in oklab, ...)`), and custom properties always serialize as raw strings, so Vue never appends `px`. Separately, vue-tsc types `wrapper.vm` from props/emits only — `<script setup>` bindings exist on the render proxy at runtime but not on the public instance type.
- **Fix**: Assert through the vm with a cast — `expect((wrapper.vm as any).shimmerStyle.backgroundImage).toContain('#F5EBD9')` — or `defineExpose` the state when it should be public API. For numeric custom properties, assert the unitless form.

### Physical borders misalign masked BorderBeam layers

- **Symptom**: The BorderBeam stroke sits just inside the rounded physical border, in both `glow` and `line` variants.
- **Cause**: A physical root border moves the absolutely positioned masked layers to the padding box, while the beam ring is drawn with `inset: 0` and `p-px`.
- **Fix**: Use the library's inset `shadow-border-base` edge on the BorderBeam host instead of a physical `border`, keeping the static edge and beam in the same box.

### Optional modelValue unions that include boolean default to false

- **Symptom**: Multi-select `v-model` starts as `[false, selectedValue]` instead of `[selectedValue]` when the parent omitted `modelValue` or passed `undefined`.
- **Cause**: Vue infers a `Boolean` runtime prop whenever the TypeScript union contains `boolean`. An omitted Boolean prop is cast to `false`, and `toArray(false)` becomes `[false]`.
- **Fix**: Keep `modelValue` typed as `string | number | (string | number)[] | null` (no `boolean`) unless a real boolean value is required. When aggregating multiple values, treat only `string`/`number` scalars and arrays as selections—not `false`.

### happy-dom does not fire Mutation/ResizeObserver for mocked scroll metrics

- **Symptom**: Composable tests that change only `scrollHeight`/`scrollTop` via `Object.defineProperties` never trigger auto-stick, even after `appendChild`.
- **Cause**: happy-dom's MutationObserver/ResizeObserver either do not deliver callbacks for these synthetic mutations, or cannot re-measure properties that were replaced with getters.
- **Fix**: Keep observer wiring for production, but assert the follow path through a deterministic public API (`stickIfNeeded` / `forceStickToBottom`). Drive scroll state with a local `scrollTo` mock + synthetic `scroll` events instead of relying on observers in unit tests.

### `cn` drops custom `text-*` utilities from variant class lists

- **Symptom**: A utility such as `text-trim-both` vanishes from the DOM when the same element also carries a font-size class built through `createTailwindVariant`, while it survives in a plain static `class` attribute.
- **Cause**: `cn` merges with tailwind-merge, which groups every `text-*` utility it recognises. An unknown/custom `text-*` class in the base is treated as a conflicting member of that group and is removed when a later `text-*` class (e.g. `text-xs`, or a colour variant) is appended.
- **Fix**: Keep a custom `text-*` utility out of a variant base when the variants themselves add `text-*` classes, or wrap it in a non-`text-*` form (e.g. an `[@media]`/arbitrary variant or a dedicated CSS rule). Static class attributes are unaffected because they never pass through `cn`.

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

### ARIA role states are gated on interactivity, not just whitelisted

- **Symptom**: A pointer-only splitter carried `aria-valuenow` / `aria-valuemin` / `aria-valuemax` / `aria-expanded`, none of which the accessibility tree may expose.
- **Cause**: `aria-expanded` is not a `separator` state at all — it marks control over *visibility*, which folding a panel never does. The `aria-value*` trio is listed for `separator` only while the element is focusable *and* its value is known, so dropping `tabindex` and the key handler silently voided all four.
- **Fix**: A splitter is binary — either a focusable separator (`tabindex="0"`, the value properties and a key handler arrive together) or a non-focusable structural divider carrying only `aria-orientation`, `aria-controls` and `aria-disabled`. Extra state goes in `aria-valuetext`, the role's only free-form field. Read a role's *conditional* wording before adding its states; the supported-state list is not the whole rule.

### A row component only skips updates on flat props and a slot-less branch

- **Symptom**: Moving PTree row markup into `PTreeNode` changed nothing measurable — every row still re-rendered on every tree update — and passing the flattened row as one `row: TreeFlatNode` prop kept it that way.
- **Cause**: Two rules stacked. Slot children give the vnode `DYNAMIC_SLOTS`, so `shouldUpdateComponent` returns `true` unconditionally — forwarding `node-content` to every row puts every row back on the update path. And `shouldUpdateComponent` compares prop *values*, while `useTreeRows` rebuilds every `TreeFlatNode` on any change, so an object prop hands every row a new identity on every selection.
- **Fix**: Pass the row field by field (scalars plus the `node` reference, which survives because it comes straight from the data prop) and render the child twice: a slot-less `<PTreeNode v-if="!hasNodeSlot" />` fast path and a `<PTreeNode v-else>` forwarding the slots. Keep the virtual-positioning wrapper div in the parent, or every scroll step re-renders the row content it positions. Measured on a 200-row tree: focus 0 rows, ArrowDown 1 row, selection 1 row (200 each before). Count renders by `instance.subTree` identity — `instance.vnode` is replaced on the skip path too and cannot tell the two apart.

### Detach before you look up a drop target, and measure drag rows by hand in tests

- **Symptom**: A `moveTreeNode` test asserted that dropping `a` onto its own child `b` relocated `a` under `b`, and got `undefined`.
- **Cause**: The walk resolved the target in the original list while the moved node was still in it, so a target inside the subtree about to be removed still looked reachable — refusing that drop is the correct behaviour, so the assertion caught the bug, not a broken implementation.
- **Fix**: Detach first, then resolve. Once the node is out of the tree, itself and every descendant are unreachable, so self / descendant / parent-changed drops are rejected with no extra checks, and `from.parent === to.parent && from.index === to.index` catches a move landing exactly where it started. In tests, hand-write `getBoundingClientRect` on each row and on the container (happy-dom has no layout), and note that a press and a release at the same `clientY` never cross the drag threshold — every case then looks like the drag was ignored.

### A spy index is not a render index

- **Symptom**: A list highlights the right row but scrolls the wrong one into view, and only when some rows have no matching DOM element.
- **Cause**: `useScrollspy` indexes the elements it resolved (`options.map(getElementById).filter(Boolean)`) while the template renders the `options` array, so one entry whose id is missing from the document shortens the resolved list and every later index points one row early. The highlight keeps working because it matches on id.
- **Fix**: Convert to a DOM index only through the rendered array (`rows.findIndex(r => r.active)`) — any "data index -> `children[n]`" lookup has to go through the array that produced the children.
- **Testing note**: Stub `getBoundingClientRect` on the container and on each row, then assert the `scrollTop` the component writes; the wrong-row bug shows up as `0` where the measured overflow is expected. Confirm the test can fail — reverting the fix moved the assertion from 120 to 0.

### The docs dev server scaffold overwrites a newly created component page

- **Symptom**: A freshly written `packages/docs/src/pages/components/<name>.md` reverts to a one-section stub ("New component description.") shortly after being saved.
- **Cause**: `packages/docs/scripts/vite-plugin-file-create-watcher.ts` hooks `watcher.on('add')` on `src/components` while the docs dev server is running. Creating the component's `index.vue` makes it run `update-exports` and then unconditionally `writeFileSync` a scaffold page over `<name>.md` — including one that already has full content.
- **Fix**: Create `index.vue` first, let the scaffold write the page, then write the real docs content afterwards (the watcher only fires on `add`, not `change`). Same applies to composable pages for new `src/composables/*.ts` files.
