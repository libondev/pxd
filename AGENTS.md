## Project Overview

**PXD** — Universal UI component library for Vue 2.7+ & 3.2+, based on the Geist Design System. Monorepo with pnpm workspaces.

### Key Characteristics

- **Type**: Component Library / UI Framework
- **Language**: TypeScript + Vue 3 (Composition API)
- **Build**: mkdist; dev stub via unbuild
- **Toolchain**: vite-plus wraps Vite, Vitest, oxlint and oxfmt — root `vite.config.ts` is the only config
- **Docs**: markdown + `vue demo` blocks in `packages/docs` (hand-rolled SPA, not VitePress)
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
│   └── cli/                 # CLI tools (future)
├── tests/                   # Unit tests (mirrors src/ structure)
└── scripts/                 # Build utilities
```

## Quick Commands

- `pnpm dev` — Dev mode (lib + docs)
- `pnpm build:lib` — Build library
- `pnpm test` — Run unit tests
- `pnpm type-check` — `vue-tsc` over `tsconfig.app.json`
- `pnpm lint:fix` — Lint and auto-fix
- `pnpm fmt:all` — Format all files

## Hard Rules (MUST follow)

- **Always** maintain dual Vue 2.7 & 3 compatibility
- **Never** edit `dist/` or generated files by hand
- **Use** Composition API with `<script setup>` only (no Options API)
- **Avoid** Vue 3-only features: `defineModel`, top-level `await`, reactive Map/Set
- **Check** existing patterns before introducing new patterns
- Events: kebab-case. Curly braces: always required.
- **Docs**: a component page must document `## Events` (every `XxxEmits` entry) and `## Methods` (every `defineExpose()` entry). Omit a section only when it is genuinely empty. Follow `.agents/guides/docs.md` exactly — headings, column names, and section order are fixed there.
- **No path aliases** in library source or tests — relative imports only.
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
- Testing → `.agents/guides/testing.md`
- Styling / Tailwind → `.agents/guides/styling.md`
- Build / release → `.agents/guides/build.md`
- Documentation / docs pages → `.agents/guides/docs.md`
- Encountering issues → `.agents/guides/pitfalls.md`
- Need code examples → `.agents/guides/patterns.md`

After resolving a new issue, append the lesson to `.agents/guides/pitfalls.md`.
After discovering a reusable pattern, append to `.agents/guides/patterns.md`.

## Skills (.agents/skills/)

`scripts/sync-skills.js` links each skill directory into `.github/`, `.claude/` and `.opencode/`.
Always edit skills under `.agents/skills/`, never in the linked copies.

- `vue-best-practices` — vue-tsc, Volar, props typing (`withDefaults` union defaults first)
- `web-design-guidelines` — UI / accessibility review against the Web Interface Guidelines
- `adversarial-reviewer` — the hostile review pass referenced under Thinking Principles
