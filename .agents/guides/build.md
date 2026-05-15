# Build, Release & CI

## Commands

- `pnpm dev` — Dev mode (lib + docs)
- `pnpm dev:lib` — Library development with stub mode
- `pnpm dev:docs` — Documentation development only
- `pnpm build:lib` — Build library (includes DTS generation and styles)
- `pnpm build` — Full build (library + docs)

## Build Process

1. **Export updates & Volar**: `scripts/update-exports.js` refreshes barrel exports, docs component list, composables index, and root `volar.d.ts`
2. **Code Compilation**: mkdist transforms `.vue` + `.ts` → `.js` + `.d.ts`
3. **Style Generation**: Tailwind processing from `source.css`

## Safety Rules

- **Never** manually edit `dist/` (it's generated)
- **Never** commit `dist/` to git
- **Always** run `pnpm build:lib` before publishing
- **Check** `volar.d.ts` is updated after new components

## Git Hooks

- **VitePlus** staged checks are active (`vite.config.ts` → `staged` block)
- Pre-commit: `vp check --fix` on `*.{js,ts,tsx,vue,html}`
- Pre-push: Type checking and tests recommended

## Git Commit Conventions

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Formatting only
- `refactor`: Code refactoring
- `perf`: Performance
- `test`: Test changes
- `chore`: Build/config updates
- `revert`: Revert commit

### Rules

- Destructive modifications: add `!` after scope
- Subject: Max 50 chars, imperative mood, no period, first letter uppercase
- Body: Optional, wrap 72 chars, explain why
- Footer: `Fixes #123`, `BREAKING CHANGE: ...`

### Examples

```
feat(api): add user authentication

Implement JWT with Alova.

Fixes #45
```

```
fix(modal)!: resolve backdrop issue

BREAKING CHANGE: onClose now receives event
```

## Troubleshooting

1. **Build fails**: Run `pnpm build:lib` in stages to isolate
2. **Type errors**: Check `tsconfig.app.json` includes and types
3. **Lint errors**: Use `pnpm lint:fix` or check rules in `vite.config.ts` → `lint:`
