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

### Volar error cache shows deleted identifiers

- **Symptom**: After removing an unused variable from an SFC, the Problems panel still reports "'xxx' is declared but its value is never read" at the old line, even though grep shows the identifier is gone.
- **Cause**: Volar keeps a stale diagnostics snapshot when the file is edited through an external process (e.g. multiple edit tool calls in one session); the error text references a symbol the current source no longer contains.
- **Fix**: Trust `pnpm type-check` (vue-tsc) and `pnpm test` as the source of truth; a re-open/reindex of the file clears the stale entry.

### Collapse `v-show` hides content from Find in page

- **Symptom**: Browser Find in page cannot match text inside a collapsed PCollapse panel, and unlike native `<details>` the panel does not auto-expand on a match.
- **Cause**: `v-show` sets `display: none`. Find in page skips that subtree. `hidden="until-found"` is the HTML primitive for this, but Vue 2.7 / 3.2 coerce `hidden` to a boolean attribute, so the string value cannot be bound reliably.
- **Fix**: Use native `<details>`/`<summary>` (Find in page opens them). Keep `open` true during the leave height animation, then remove it. Skip enter motion when `toggle` opens the element without a click (find / fragment navigation).

### Child registerItem order reverses after HMR

- **Symptom**: Resizable panels flip after hot-reloading a child SFC.
- **Cause**: Vue HMR remounts sibling instances with unregister/register interleaved last-to-first, so `push()` order is the reverse of the DOM.
- **Fix**: `useOrderedChildren` — Map keyed by instance id; once each child has an element, sort with `compareDocumentPosition`. Register once in `setup` (no el, SSR-safe) and again in `onMounted` (with el). Do not walk VNodes.


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
- **Fix**: Use ordinary descendant selectors in global component styles, or add `scoped` when the rules require `:deep()`.

### Forwarding slots in v-for re-renders every child on each parent update

- **Symptom**: Selecting a date in PCalendar felt slow; profiling showed all 42 day cells re-rendered per click while only 2 changed in the DOM.
- **Cause**: A component vnode with `patchFlag & 1024` (DYNAMIC_SLOTS) makes `shouldUpdateComponent` return `true` unconditionally. Slot children get this flag when the compiler marks them dynamic (slot content references parent scope such as `$slots`) or when `normalizeChildren` sees a forwarded slot (`_: 3`) whose owning component's own slots are unstable (no slots passed -> `instance.slots._` undefined; or dynamic slots).
- **Fix**: Avoid forwarding user slots inside `v-for` children. Render the child without slot children when the user slot is absent (`v-if="$slots.default"` branch plus a slot-less `v-else` branch), so unchanged cells skip via the props path. Alternative (internal-only): set `useSlots()._ = 1` when the component receives no slots, which relies on Vue's undocumented SlotFlags and is fragile. `v-memo` would also fix it but is Vue 3-only and breaks Vue 2.7 compat.

### Vue test warnings: unresolved components and reactive component props

- **Symptom**: `pnpm test` prints `[Vue warn]: Failed to resolve component: PSpinner` / `RouterLink` even when the `v-if` branch that renders them is never taken.
- **Cause**: `resolveComponent()` calls are hoisted out of the `v-if` branch at compile time, so the lookup (and warning) happens on every render. Library-internal components must be imported statically; host-provided ones (`RouterLink`) must be stubbed in tests via `global.stubs`.
- **Fix**: Import library sub-components in the SFC (e.g. `import PSpinner from '../spinner/index.vue'`), and add `RouterLink: RouterLinkStub` to the `mount` `global.stubs` for tests rendering `to` links.

### Vue test warnings: component object props made reactive by VTU

- **Symptom**: `[Vue warn]: Vue received a Component that was made a reactive object` when a test passes a component object (`defineComponent`, SFC) through `mount` props (`icon`, `separatorIcon`).
- **Cause**: Vue Test Utils' `baseMount` stores all mount props in `Vue.reactive({})` so `setProps` triggers re-renders; component objects passed as prop values get deep-wrapped in reactive proxies, which Vue's `createVNode` flags as a performance hazard.
- **Fix**: Pass component objects as `markRaw(Component)` in test mount props, matching what real consumers should do when storing components in reactive state.

### happy-dom drops unparsable style declarations and never appends px to custom properties

- **Symptom**: Asserting `wrapper.attributes('style')` for a computed style that contains `color-mix()` (e.g. PShimmerText's `backgroundImage`) returns only the custom-property declarations — `background-image` is missing. Numeric custom-property values also serialize without a `px` suffix (`--xs: 196;`, not `--xs: 196px`).
- **Cause**: happy-dom's `CSSStyleDeclaration.setProperty` silently ignores values its CSS parser cannot handle (`color-mix(in oklab, ...)`), and custom properties always serialize as raw strings, so Vue never appends `px` for them (it only does for known CSS properties).
- **Fix**: Do not assert `color-mix` gradient content through the style attribute; read the component's computed instead (`wrapper.vm.shimmerStyle.backgroundImage` — script-setup bindings are exposed on `vm` in the dev build). For numeric custom properties, assert the unitless form (`--xs: 196;`).

### Test assertions on `<script setup>` internals need a vm cast, not DOM style reads

- **Symptom**: `wrapper.vm.shimmerStyle` in tests errors with TS2339 (`Property 'shimmerStyle' does not exist on type 'ComponentPublicInstance<...>'`); switching to `wrapper.attributes('style')` then fails at runtime because the serialized attribute contains only `--shimmer-total-duration` and drops the `background-image` gradient.
- **Cause**: vue-tsc types `wrapper.vm` from the component's props/emits only — `<script setup>` bindings are not part of the public instance type, although the render proxy exposes them at runtime. The DOM fallback fails because happy-dom's CSS parser rejects the `color-mix(...)`/`calc(...)` gradient value and silently omits that declaration from the style attribute.
- **Fix**: Cast the vm like the existing overlay.test.ts pattern: `expect((wrapper.vm as any).shimmerStyle.backgroundImage).toContain('#F5EBD9')` — or `defineExpose` the state when it should be public API.

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

- **Symptom**: A container whose header is built from registered children renders an empty header during SSR and on the first client frame; the items only show up after mount.
- **Cause**: A child registers in its `setup`, which runs while the parent`s own subtree is being patched — after the parent`s render function already read the (empty) registry. In SSR nothing re-renders afterwards, so the markup is simply absent from the HTML.
- **Fix**: If the container only needs the *data*, take an `options` prop and render from it — PTabs and PSteps both moved this way, and their `contexts/*.ts` files went with them. Keep the self-registering pattern (`useOrderedChildren`) only where children are really measured or ordered in the DOM, which today means PResizable. PCarousel only ever needed a count, so it moved to an `options` prop too: `PCarouselItem` and `contexts/carousel.ts` went with it.

### Isolating repeated slot content behind a wrapper component does not pay for itself

- **Symptom**: Every row/slide re-renders whenever the container re-renders — hovering one row of a 200-row PList invoked the `item` slot 40200 times per sweep; a carousel swipe frame rebuilds all slide content.
- **Cause**: Children declared inside a `v-for` with slot content get `patchFlag & 1024` (`DYNAMIC_SLOTS`), so `shouldUpdateComponent` returns `true` for all of them whenever the container re-renders. Note the content is *not* the shared-render-effect problem it looks like: a scoped slot function is invoked by the child that renders it, so reactive reads inside it already land in that child`s effect.
- **Tried**: A stateful wrapper that takes the slot function as a `render` prop plus stable scope props (`PCarouselItemSlot` / `PListItemSlot`), so unchanged content is skipped. It works — counters prove the wrappers were created once and rendered once while the container re-rendered hundreds of times — but it is slower in wall clock:
  - PList, 200-row hover sweep: no-slot floor 1.35s both ways, rich row 1.72s -> 1.71s, trivial row 1.38s -> 1.70s (23% slower).
  - PCarousel, 20 slides x 200 swipe frames: no-slot floor 14.7ms both ways, light 23.0ms -> 57.6ms, rich 23.2ms -> 53.6ms (~2.4x slower).
- **Fix**: Keep the inline `<slot>`. Rebuilding a slide/row vnode tree is cheap compared with the per-item component vnode + `shouldUpdateComponent` path the wrapper adds to every container render. Both wrappers were measured and reverted.

### Roving tabindex without a key handler locks keyboard users out

- **Symptom**: Only the selected tab is reachable with the Tab key, and arrow keys do nothing.
- **Cause**: `:tabindex="active ? 0 : -1"` implements half of the APG tabs pattern; the arrow/Home/End handler is the other half. Without it the inactive tabs are unreachable.
- **Fix**: Drive the handler from `useListNavigation` + `useListKeyboardController`, keep the navigation index in sync with the active value, and move focus with `scrollToIndex` so the selected tab stays visible.

### `git checkout-index -f -a` skips files that only differ in line endings

- **Symptom**: `pnpm fmt:eol` rewrote `src/` files but left `.md` and other documents on CRLF.
- **Cause**: With `* text=auto eol=lf` in `.gitattributes`, a CRLF working copy is *content identical* to the LF blob, so git treats such a file as up to date and skips it even with `-f`; only files whose size/mtime changed were written back.
- **Fix**: `scripts/fmt-eol.js` rewrites the tracked files directly. Rewriting invalidates the index stat entry, which makes `git status` report the file as modified although the blob is unchanged, so the script re-adds the rewritten files whose bytes still match the blob — `git update-index --refresh` does not clear this.

### Per-gesture recognizer state must be reset by the terminal handler

- **Symptom**: In a pointer recognizer, a tap is treated as vetoed after the previous gesture was vetoed — the next tap silently stops working.
- **Cause**: Per-gesture state (`startVerdict`, the start gate, axis lock) was initialised in the `onStart` callback, which only fires once movement passes `swipeThreshold`. A tap never reaches `onStart`, so it reads whatever the *previous* gesture left behind.
- **Fix**: Clear the state in whichever handler ends the interaction (`onEnd`, `onTap`/`onIdle`, `onCancel`) instead of at the start of the next one. If a terminal handler must await something before it can classify the gesture, capture what it needs in locals first — the deferred callback must not read fields that have already been reset.
