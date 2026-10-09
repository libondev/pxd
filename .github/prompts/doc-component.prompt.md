---
description: "Generate or update the docs page for a pxd component following existing doc conventions"
name: doc-component
argument-hint: "component name, e.g. page-number"
agent: "agent"
tools: ['read', 'search', 'edit']
---

Generate or update the documentation page for the `$ARGUMENTS` component.

## Steps

1. Read the component source in `src/components/$ARGUMENTS/` (`index.vue`, `types.d.ts`). Shared types live in `src/types/shared/`.
2. Read `.agents/guides/docs.md` — it is the single source of truth for headings, table columns and section order.
3. Check whether `packages/docs/src/pages/components/$ARGUMENTS.md` exists:
   - **Exists**: reconcile it with the current implementation — add missing props/events/slots/methods/demos, remove stale entries.
   - **Missing**: create it.
4. Write the page: `# Title Case Name`, a one-line summary, one `## Section` per feature with a runnable ```vue demo``` block, then the API tables in the fixed order `## Props` → `## Events` → `## Slots` → `## Methods`.
   - `## Props` table: `| Name | Type | Default | Description |`
   - `## Events` table: `| Name | Type | Description |`
   - `## Slots` table: `| Name | Description |`
   - `## Methods` table: `| Name | Type | Description |`
   - Omit a section when it would be empty; never write an empty table or a placeholder.

## Rules

- Demos use the globally registered `P<ComponentName>` components — do NOT import components from `src`; only import from `vue` when refs are needed.
- One feature per demo section; keep demos minimal and focused.
- Prop and event names in kebab-case; the Type column must reflect the actual TypeScript types from the implementation, including defaults.
- Document every entry of `XxxEmits` and every entry of `defineExpose()`; leave no stale entries from previous versions.
- Doc text in English.
- Do NOT modify the component source itself; this task is documentation only.
