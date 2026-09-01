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

### Child registerItem order reverses after HMR

- **Symptom**: Steps numbers, tab labels, carousel slides, or Resizable panels flip after hot-reloading a child SFC.
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
