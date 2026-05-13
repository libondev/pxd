## Project Overview

**PXD** is a universal UI component library for Vue 2 & 3, based on the Geist Design System. This is a monorepo workspace that includes both the core library and documentation.

### Key Characteristics

- **Type**: Component Library / UI Framework
- **Target**: Vue 2.7+ and Vue 3.2+ (Universal Compatibility)
- **Architecture**: Monorepo with pnpm workspaces
- **Language**: TypeScript + Vue 3 (Composition API)
- **Build System**: mkdist + unbuild (dev toolchain via vite-plus)
- **Documentation**: VitePress-based docs in `packages/docs`
- **Package Manager**: pnpm@10.33.0 with workspace catalog

## Project Structure

```
pxd/
├── src/                      # Source code
│   ├── components/          # Vue components
│   ├── composables/         # Vue composables
│   ├── contexts/            # Vue context providers
│   ├── locales/             # Internationalization
│   ├── plugins/             # Plugin system
│   ├── styles/              # CSS/Tailwind styles
│   ├── types/               # TypeScript definitions
│   └── utils/               # Utility functions
├── packages/
│   ├── cli/                 # CLI tools (future)
│   └── docs/                # Documentation site
├── tests/                   # Unit tests
├── dist/                    # Build output
└── scripts/                 # Build utilities
```

## Development Workflow

### Commands

- `pnpm dev` - Start both library and docs in dev mode
- `pnpm dev:lib` - Library development with stub mode
- `pnpm dev:docs` - Documentation development only
- `pnpm build:lib` - Build library (includes DTS generation and styles)
- `pnpm build` - Full build (library + docs)
- `pnpm test` - Run unit tests (`vp test run`)
- `pnpm test:watch` - Run tests in watch mode (`vp test`)
- `pnpm lint` - Lint staged files with oxlint
- `pnpm lint:all` - Lint all files (`vp lint`)
- `pnpm lint:fix` - Lint and auto-fix (`vp lint --fix`)
- `pnpm fmt` - Format staged files with oxfmt
- `pnpm fmt:all` - Format all files (`vp fmt`)
- `pnpm fmt:check` - Check formatting (`vp fmt --check`)

### Code Quality Standards

#### TypeScript Configuration

- **Target**: ES2022+ with module system
- **Strict mode**: Enabled with tsconfig references
- **Volar integration**: Full Vue language support
- **Type exports**: All public APIs have proper type definitions

#### Linting & Formatting (VitePlus / oxlint / oxfmt)

- **Linter**: oxlint via `vite-plus` (`vp lint`), configured in `vite.config.ts` under `lint:`
- **Formatter**: oxfmt via `vite-plus` (`vp fmt`), configured in `vite.config.ts` under `fmt:`
- **Tailwind-specific rules**: `eslint-plugin-better-tailwindcss` enforced via oxlint
- **Curly braces**: Always required
- **Event naming**: kebab-case for custom events
- **Import sorting**: Side effects first, internal patterns (`~/`, `@/`, `#/`), no newlines between groups
- **Tailwind class sorting**: Enforced with `sortTailwindcss` in fmt config

#### Testing Strategy

- **Framework**: Vitest (via vite-plus)
- **Environment**: happy-dom (browser-like)
- **Pattern**: `**/*.test.ts` files
- **Config**: In `vite.config.ts` under `test:` block (no separate `vitest.config.ts`)
- **TypeScript**: `tsconfig.test.json` extends `tsconfig.app.json` with `vitest/happy-dom` types
- **Typecheck**: `vue-tsc -p tsconfig.app.json --noEmit` (configured as vite-plus task)
- **Pool**: vmThreads for performance

### Build & Distribution

#### Entry Points

The library exposes multiple entry points:

- Root: `.` (main+types)
- `./resolver` - Unplugin resolver
- `./components` - All components
- `./composables` - All composables
- `./locales` - i18n files
- Plus granular per-item imports

#### Build Process

1. **Export updates & Volar**: `scripts/update-exports.js` refreshes barrel exports, docs component list, composables index, and root `volar.d.ts`
2. **Code Compilation**: mkdist transforms `.vue` + `.ts` → `.js` + `.d.ts`
3. **Style Generation**: Tailwind processing from `source.css`

## AI Agent Guidelines

### When Modifying Code

#### 1. Component Development

- Use **Composition API** with `<script setup>`
- Ensure Vue 2.7 compatibility (avoid Vue 3-only features)
- Follow proper component structure:

  ```vue
  <script setup lang="ts">
  // Imports
  // Props with defineProps
  // Emits with defineEmits
  // Logic
  </script>

  <template>
    <!-- Template -->
  </template>

  <style scoped>
  /* Scoped styles */
  </style>
  ```

#### 2. TypeScript Best Practices

- Always use strict types
- Export types from `./types/shared` for public API
- Use proper JSDoc comments for complex logic
- Leverage generics for reusable composables

#### 3. Tailwind Integration

- **Entry point**: `src/styles/tw.css`
- **Rules**: Follow ESLint plugin constraints strictly
- **Ordering**: Use "improved" order (sort by property category)
- **Duplicates**: Never duplicate utility classes
- **Shorthand**: Always use shorthand syntax (e.g., `m-2` not `margin: 0.5rem`)

#### 4. Testing Requirements

- Write tests for all critical paths
- Edge cases should be covered
- Use `describe`/`it` blocks for organization
- Mock external dependencies appropriately
- Test both Vue 2.7 and Vue 3 scenarios if necessary

### Common Pitfalls to Avoid

#### Vue 2.7 Compatibility

- ❌ Avoid: `defineModel`, top-level `await`, reactive arrays with Map/Set
- ✅ Use: `defineProps`, `defineEmits`, `ref`, `reactive`, `computed`

#### Build Safety

- Never manually edit `dist/` (it's generated)
- Always run `pnpm build:lib` before publishing
- Check `volar.d.ts` is updated after new components

#### Git Hooks

- **VitePlus** staged checks are active (`vite.config.ts` → `staged` block)
- Pre-commit: `vp check --fix` on `*.{js,ts,tsx,vue,html}`
- Pre-push: Type checking and tests recommended

### Documentation Standards

#### Code Comments

- **Function/Class level**: Explain purpose, parameters, return values
- **Complex logic**: Explain "why" and "how" in English
- **Avoid**: Obvious comments (e.g., `i++ // increment i`)

#### Component APIs

- Use clear prop names
- Document events with kebab-case
- Provide JSDoc for TypeScript types
- Use consistent naming conventions

## Key Dependencies

### Framework & Build

- **Vue**: 3.5.32 (supporting 2.7+)
- **VitePlus**: 0.1.20 (unified dev toolchain wrapping Vite, Vitest, oxlint, oxfmt)
- **mkdist**: 2.4.1 (distribution builder)
- **unbuild**: 3.6.1 (stub development)

### Code Quality

- **TypeScript**: 5.9.3 (strict mode enabled)
- **vue-tsc**: Vue type checking
- **oxlint/oxfmt**: Via vite-plus (replaces ESLint/Prettier)

### Styling

- **TailwindCSS**: 4.2.2
- **PostCSS**: Integrated

### Related Packages

- **@gdsicon/vue**: 1.0.9 (icon library)
- **Day.js**: 1.11.20 (date utilities)

## Important Files to Reference

- **tsconfig.json** - Base TypeScript configuration
- **tsconfig.app.json** - Vue application config
- **tsconfig.test.json** - Test environment config (uses `vitest/happy-dom` types)
- **vite.config.ts** - Unified config for test, lint (oxlint), fmt (oxfmt), and tasks
- **pnpm-workspace.yaml** - Monorepo catalog and dependencies
- **scripts/** - Build utilities (never modify unless necessary)

## Resolution Strategy

When encountering issues:

1. **Type errors**: Check `tsconfig.app.json` includes and types
2. **Tailwind issues**: Verify entry point `src/styles/tw.css`
3. **Build fails**: Run `pnpm build:lib` in stages to isolate
4. **Test fails**: Check test environment setup and mocks (config in `vite.config.ts` → `test:`)
5. **Lint errors**: Use `pnpm lint:fix` or check rules in `vite.config.ts` → `lint:`

## Notes for AI Agents

- **Always** maintain dual Vue 2.7 & 3 compatibility
- **Never** commit directly to `dist/` or generated files
- **Prefer** Composition API over Options API
- **Check** existing patterns before introducing new patterns
- **Update** `AGENTS.md` when adding significant new project patterns
- **Respect** the strict TypeScript and Tailwind rules in place

## Git Commit Conventions

### Format

<type>(<scope>): <subject>

<body>

<footer>

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Formatting only
- **refactor**: Code refactoring
- **perf**: Performance
- **test**: Test changes
- **chore**: Build/config updates
- **revert**: Revert commit

### Rules

- When there are destructive modifications, add ! after scope.
- Subject: Max 50 chars, imperative mood, no period, first letter uppercase
- Body: Optional, wrap 72 chars, explain why
- Footer: Fixes #123, BREAKING CHANGE: ...

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
