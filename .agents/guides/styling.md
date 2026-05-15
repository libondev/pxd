# Styling & Tailwind

## Tailwind Integration

- **Entry point**: `src/styles/tw.css`
- **Version**: TailwindCSS 4.2.2

## Rules

- **Ordering**: Use "improved" order (sort by property category)
- **Duplicates**: Never duplicate utility classes
- **Shorthand**: Always use shorthand syntax (e.g., `m-2` not `margin: 0.5rem`)
- **Tailwind-specific rules**: `eslint-plugin-better-tailwindcss` enforced via oxlint
- **Class sorting**: Enforced with `sortTailwindcss` in fmt config

## Linting & Formatting (VitePlus / oxlint / oxfmt)

- **Linter**: oxlint via `vite-plus` (`vp lint`), configured in `vite.config.ts` under `lint:`
- **Formatter**: oxfmt via `vite-plus` (`vp fmt`), configured in `vite.config.ts` under `fmt:`
- **Curly braces**: Always required
- **Event naming**: kebab-case for custom events
- **Import sorting**: Side effects first, internal patterns (`~/`, `@/`, `#/`), no newlines between groups

## Commands

- `pnpm lint` — Lint staged files
- `pnpm lint:all` — Lint all files
- `pnpm lint:fix` — Lint and auto-fix
- `pnpm fmt` — Format staged files
- `pnpm fmt:all` — Format all files
- `pnpm fmt:check` — Check formatting
