## Project Overview

**PXD** — Universal UI component library for Vue 2.7+ & 3.2+, based on the Geist Design System. Monorepo with pnpm workspaces.

### Key Characteristics

- **Type**: Component Library / UI Framework
- **Language**: TypeScript + Vue 3 (Composition API)
- **Build**: mkdist + unbuild (dev via vite-plus)
- **Docs**: VitePress in `packages/docs`
- **Package Manager**: pnpm

## Project Structure

```
pxd/
├── src/
│   ├── components/          # Vue components
│   ├── composables/         # Vue composables
│   ├── contexts/            # Vue context providers
│   ├── locales/             # i18n
│   ├── plugins/             # Plugin system
│   ├── styles/              # CSS/Tailwind
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
- `pnpm lint:fix` — Lint and auto-fix
- `pnpm fmt:all` — Format all files

## Hard Rules (MUST follow)

- **Always** maintain dual Vue 2.7 & 3 compatibility
- **Never** commit directly to `dist/` or generated files
- **Use** Composition API with `<script setup>` only (no Options API)
- **Avoid** Vue 3-only features: `defineModel`, top-level `await`, reactive Map/Set
- **Check** existing patterns before introducing new patterns
- Events: kebab-case. Curly braces: always required.
- Prefer `pnpm` commands. Never manually edit `dist/`.
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
After completing a feature, proactively challenge the implementation:
- Assume the code has bugs — find them
- Check all edge cases, security vectors, and hidden assumptions
- Rate issues by severity: Critical / High / Medium / Low

## Knowledge Base (.agents/)

**Before every task, read `.agents/guides/architecture.md`.**

Then consult the relevant file:

- Component development → `.agents/guides/components.md`
- Testing → `.agents/guides/testing.md`
- Styling / Tailwind → `.agents/guides/styling.md`
- Build / release / CI → `.agents/guides/build.md`
- Encountering issues → `.agents/guides/pitfalls.md`
- Need code examples → `.agents/guides/patterns.md`

After resolving a new issue, append the lesson to `.agents/guides/pitfalls.md`.
After discovering a reusable pattern, append to `.agents/guides/patterns.md`.
