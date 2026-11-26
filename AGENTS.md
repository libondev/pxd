## Project Overview

**PXD** — Universal UI component library for Vue 3.3+, based on the Geist Design System. Monorepo with pnpm workspaces.

### Key Characteristics

- **Type**: Component Library / UI Framework
- **Language**: TypeScript + Vue 3 (Composition API)
- **Build**: mkdist; dev stub via unbuild
- **Toolchain**: vite-plus wraps Vite, Vitest, oxlint and oxfmt — root `vite.config.ts` is the only config for the library; `packages/docs` owns its own
- **Docs**: markdown + `vue demo` blocks in `packages/docs`
- **Package Manager**: pnpm

## Project Structure

```
pxd/
├── src/
│   ├── components/          # Vue components
│   ├── composables/         # Vue composables
│   ├── constants/           # Shared constants
│   ├── contexts/            # Vue context providers
│   ├── locales/             # i18n
│   ├── plugins/             # Plugin system
│   ├── styles/              # CSS/Tailwind (entry: tw.css)
│   ├── types/               # Shared TypeScript types
│   └── utils/               # Utility functions
├── packages/
│   ├── docs/                # Documentation site
│   └── cli/                 # CLI tools (placeholder, private, not published)
├── tests/                   # Unit tests (mirrors src/ structure)
└── scripts/                 # Build utilities
```

## Quick Commands

- `pnpm dev` — Dev mode (lib + docs)
- `pnpm build:lib` — Build library
- `pnpm test` — Run unit tests
- `pnpm check:type` — `vue-tsc` over `tsconfig.app.json` and `tsconfig.test.json`
- `pnpm lint:fix` — Lint and auto-fix
- `pnpm fmt` — Format all files

## Browser Support

**Baseline: Chrome/Edge 120 · Firefox 128 · Safari/iOS 16.4.** This is the floor for the published library, not just the docs site.

- The floor is set by the **Tailwind v4 output**, not by Vue's release year: `@property` needs Firefox 128 / Safari 16.4 / Chrome 85, and `color-mix()` needs Chrome 111 / Safari 16.2 / Firefox 113. Lowering it means auditing the generated CSS, not just the source.
- A platform feature may be used directly only when **all three** engines support it at that version.
- Anything newer goes behind a feature-detected helper in `src/utils/_internal/` that calls the native API when present and falls back otherwise — see `promise.ts` (`Promise.withResolvers`). Never patch globals, never add a hard dependency, never gate on `userAgent`.
- Native features that degrade silently (unknown CSS properties, unsupported HTML attributes) may be used as progressive enhancement; features that throw must be routed through a helper.
- Raising this floor is a decision, not a side effect of a refactor.
- **Still out of reach** (Safari is almost always the blocker): `popover` (17), `transition-behavior: allow-discrete` (17.4), `@starting-style` (17.5), `<details name>` (17.2), `scrollbar-width/color` (18.2), `scrollend` (26.2), `Promise.withResolvers` (17.4), `field-sizing` (26.2), `:user-invalid` (16.5), `closedby` (no Safari at all). Re-check before assuming any of them can be adopted.

## Hard Rules (MUST follow)

- **Always** target Vue 3.3+ only, no runtime version checks
- **Always** respect the browser baseline above when adopting a web platform API
- **Never** edit `dist/` or generated files by hand
- **Use** Composition API with `<script setup>` only (no Options API)
- **Order** `<script setup>` top-level code exactly: imports → defineOptions/props/emits → plain consts → refs/computed → custom composables → functions → watch/provide → lifecycles → defineExpose. Do not interleave these groups, except where a later declaration is a dependency of an earlier one — dependency wins, and `pnpm lint:fix` keeps that order.
- **Avoid** post-3.3 APIs: `defineModel` (3.4+), top-level `await` in `<script setup>`
- **Check** existing patterns before introducing new patterns
- **Composables**: never take a component's `props` object or `emits` — see `.agents/guides/composables.md`
- **Never** add a re-export (`export ... from`, `export type { X }`) — import from the defining module; only generated barrels may re-export.
- Events: kebab-case. Curly braces: always required.
- **Docs**: a component page must document `## Events` (every `XxxEmits` entry) and `## Methods` (every `defineExpose()` entry). Omit a section only when it is genuinely empty. Follow `.agents/guides/docs.md` exactly — headings, column names, and section order are fixed there.
- **No path aliases** in library source or tests — relative imports only.
- **CSS placement**: `src/styles/tw.css` holds only theme tokens, `@source` directives and styles shared by multiple components. A rule only one component needs stays in that component's `<style lang="postcss">`.
- **Minimal changes only** — implement exactly what is asked, nothing more
- **Do NOT** add features, error handling, or abstractions not explicitly requested
- **Do NOT** add defensive validations for empty/null/undefined fields unless asked — this is a greenfield project
- **Do NOT** refactor working code unless asked to
- **Do NOT** add comments, JSDoc, or README updates unless asked to
- **Ask first** if requirements are ambiguous rather than guessing and over-building

## Thinking Principles

### First Principles Thinking

When solving complex problems, fixing bugs, or designing architecture,
always reason from first principles:
1. Identify the fundamental facts and constraints
2. Strip away assumptions and conventions
3. Re-derive the solution from what is actually true
4. Validate that the solution addresses the root cause, not symptoms

### Adversarial Review

After completing a feature, run the `adversarial-reviewer` skill: assume the code has bugs, check
edge cases, security vectors and hidden assumptions, and rate every finding Critical / High /
Medium / Low.

## Knowledge Base (.agents/)

**Before every task, read `.agents/guides/architecture.md`.**

Then consult the relevant file:

- Component development → `.agents/guides/components.md`
- Composable design → `.agents/guides/composables.md`
- Testing → `.agents/guides/testing.md`
- Styling / Tailwind → `.agents/guides/styling.md`
- Build / release → `.agents/guides/build.md`
- Documentation / docs pages → `.agents/guides/docs.md`
- Encountering issues → `.agents/guides/pitfalls.md`
- Need code examples → `.agents/guides/patterns.md`

After resolving a new issue, append the lesson to `.agents/guides/pitfalls.md` — only when the lesson
transfers, per the criteria in that file.
After discovering a reusable pattern, append to `.agents/guides/patterns.md`.

## Skills (.agents/skills/)

Always edit skills under `.agents/skills/`.

- `vue-best-practices` — vue-tsc, Volar, props typing (`withDefaults` union defaults first)
- `web-design-guidelines` — UI / accessibility review against the Web Interface Guidelines
- `adversarial-reviewer` — the hostile review pass referenced under Thinking Principles
