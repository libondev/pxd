## Project Overview

**PXD** is a universal UI component library for Vue 2 & 3, based on the Geist Design System. This is a monorepo workspace that includes both the core library and documentation.

### Key Characteristics

- **Type**: Component Library / UI Framework
- **Target**: Vue 2.7+ and Vue 3.2+ (Universal Compatibility)
- **Architecture**: Monorepo with pnpm workspaces
- **Language**: TypeScript + Vue 3 (Composition API)
- **Build System**: mkdist + unbuild
- **Documentation**: VitePress-based docs in `packages/docs`

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
- `pnpm test` - Run unit tests
- `pnpm lint` - Run ESLint
- `pnpm typecheck` - TypeScript compilation check
- `pnpm build` - Full build (library + docs)

### Code Quality Standards

#### TypeScript Configuration

- **Target**: ES2022+ with module system
- **Strict mode**: Enabled with tsconfig references
- **Volar integration**: Full Vue language support
- **Type exports**: All public APIs have proper type definitions

#### ESLint Rules

- **Tailwind-specific rules**: Strict class ordering, no conflicts, no duplicates
- **Curly braces**: Always required
- **Event naming**: kebab-case for custom events
- **One True Brace Style**: 1tbs with single-line allowance

#### Testing Strategy

- **Framework**: Vitest + Vue Test Utils
- **Environment**: happy-dom (browser-like)
- **Pattern**: `**/*.test.ts` files
- **Setup**: Custom `vitest.setup.ts`
- **Isolation**: vmThreads pool for performance

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

1. **DTS Generation**: `scripts/gen-component-dts.js` for Volar support
2. **Code Compilation**: mkdist transforms `.vue` + `.ts` → `.js` + `.d.ts`
3. **Style Generation**: Tailwind processing from `source.css`
4. **Export Updates**: `scripts/update-exports.js` for package.json

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

- **Husky** + **lint-staged** are active
- Pre-commit: ESLint auto-fix on `*.{ts,vue}`
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

- **Vue**: 3.5.25 (supporting 2.7+)
- **Vite**: 8.0.0-beta (build tool)
- **mkdist**: 2.4.1 (distribution builder)
- **unbuild**: 3.6.1 (stub development)

### Code Quality

- **TypeScript**: 5.9.3 (strict mode enabled)
- **ESLint**: 9.39.1 with @antfu/config
- **Vitest**: 4.0.15 (test runner)
- **Happy-DOM**: 20.0.11 (test environment)

### Styling

- **TailwindCSS**: 4.1.17
- **PostCSS**: Integrated

### Related Packages

- **@gdsicon/vue**: 1.0.7 (icon library)
- **Day.js**: 1.11.19 (date utilities)

## Important Files to Reference

- **tsconfig.json** - Base TypeScript configuration
- **tsconfig.app.json** - Vue application config
- **vitest.config.ts** - Test runner configuration
- **eslint.config.ts** - Linter rules and Tailwind settings
- **pnpm-workspace.yaml** - Monorepo catalog and dependencies
- **scripts/** - Build utilities (never modify unless necessary)

## Resolution Strategy

When encountering issues:

1. **Type errors**: Check `tsconfig.app.json` includes and types
2. **Tailwind issues**: Verify entry point `src/styles/tw.css`
3. **Build fails**: Run `pnpm build:lib` in stages to isolate
4. **Test fails**: Check test environment setup and mocks
5. **Lint errors**: Use `pnpm lint:fix` or check ESLint config

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
