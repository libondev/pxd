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
