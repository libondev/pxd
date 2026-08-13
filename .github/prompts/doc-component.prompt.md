---
description: "Generate or update the docs page for a pxd component following existing doc conventions"
name: doc-component
argument-hint: "component name, e.g. page-number"
agent: "agent"
tools: ['read', 'search', 'edit']
---

Generate or update the documentation page for the `$ARGUMENTS` component.

## Steps

1. Read the component source in `src/components/$ARGUMENTS/` (implementation, `types.ts`, props/emits definitions). If it references shared types, read them from `src/types/shared/`.
2. Check whether `packages/docs/src/pages/components/$ARGUMENTS.md` exists:
   - **Exists**: reconcile it with the current implementation — add missing props/events/slots/demos, remove stale entries.
   - **Missing**: create it.
3. Use `packages/docs/src/pages/components/page-number.md` as the format reference and follow its structure exactly:
   - `# Title Case Name` followed by a one-line description
   - One `## Section` per feature, each with a runnable ```vue demo fenced block
   - `## Props` table: `| Name | Type | Default | Description |`
   - `## Events` table: `| Name | Parameters | Description |`
   - `## Slots` table in the same style, only if the component exposes slots

## Rules

- Demos use the globally registered `P<ComponentName>` components — do NOT import components from `src`; only import from `vue` when refs are needed.
- One feature per demo section; keep demos minimal and focused.
- Prop and event names in kebab-case; the Type column must reflect the actual TypeScript types from the implementation, including defaults.
- Every prop, emit, and slot in the implementation must be documented; no stale entries left over from previous versions.
- Doc text in English.
- Do NOT modify the component source itself; this task is documentation only.
