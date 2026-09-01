# Patterns

Reusable code patterns and examples discovered during development.

## Format

### {Pattern name}

- **Use case**: When to use this pattern
- **Example**: Code snippet

---

## Entries

<!-- Add new entries below this line -->

### Per-app unique id via `$root` + WeakMap

- **Use case**: DOM `id`/`for` and registry keys that must be unique within an app, SSR-stable, and not forked by Vue 2.7 vs 3 APIs.
- **Example**: `getUniqueId` — count on `getCurrentInstance().proxy.$root` (exists on both 2.7 and 3); each `createApp` / `new Vue()` starts at 0. No `useId` / `appContext`.

### Ordered child registry via document position

- **Use case**: A parent (Steps, Tabs, Carousel, Resizable) needs an ordered list of self-registering children, including after HMR, without walking Vue 2/3 VNodes.
- **Example**: `useOrderedChildren` — `register(key, payload, el?)` / `unregister(key)`. Setup registers without `el` (SSR / first paint uses Map insertion order); `onMounted` registers again with the root element so items sort by `compareDocumentPosition`.
