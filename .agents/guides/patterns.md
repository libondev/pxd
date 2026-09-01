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

### List selection session

- **Use case**: A popover or menu that updates `v-model` immediately but should only emit `change` when the interaction commits (menu close in multiple mode).
- **Example**: `useListSelection` — local `selected` is the source of truth while open; `select()` returns whether the overlay should close; `commit()` emits `change` only if multiple selection actually changed.
