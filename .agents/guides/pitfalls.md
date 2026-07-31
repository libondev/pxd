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
