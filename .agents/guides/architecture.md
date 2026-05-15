# Project Architecture

## Overview

PXD is a universal UI component library for Vue 2.7+ and Vue 3.2+, based on the Geist Design System. Monorepo with pnpm workspaces.

## Key Characteristics

- **Type**: Component Library / UI Framework
- **Target**: Vue 2.7+ and Vue 3.2+ (Universal Compatibility)
- **Architecture**: Monorepo with pnpm workspaces
- **Language**: TypeScript + Vue 3 (Composition API)
- **Build System**: mkdist + unbuild (dev toolchain via vite-plus)
- **Documentation**: VitePress-based docs in `packages/docs`
- **Package Manager**: pnpm@10.33.0 with workspace catalog

## Directory Structure

```
pxd/
├── src/
│   ├── components/          # Vue components (one directory each)
│   ├── composables/         # Vue composables
│   ├── contexts/            # Vue context providers
│   ├── locales/             # i18n
│   ├── plugins/             # Plugin system
│   ├── styles/              # CSS/Tailwind styles (entry: tw.css)
│   ├── types/               # TypeScript definitions
│   └── utils/               # Utility functions
├── packages/
│   ├── cli/                 # CLI tools (future)
│   └── docs/                # VitePress documentation site
├── tests/                   # Unit tests (mirrors src/ structure)
├── dist/                    # Build output (never edit)
└── scripts/                 # Build utilities
```

## TypeScript Configuration

- **Target**: ES2022+ with module system
- **Strict mode**: Enabled with tsconfig references
- **Volar integration**: Full Vue language support
- **Type exports**: All public APIs have proper type definitions
- **tsconfig.json** — Base configuration
- **tsconfig.app.json** — Vue application config
- **tsconfig.test.json** — Test environment (uses `vitest/happy-dom` types)

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

## Important Files

- **vite.config.ts** — Unified config for test, lint (oxlint), fmt (oxfmt), and tasks
- **pnpm-workspace.yaml** — Monorepo catalog and dependencies
- **scripts/** — Build utilities (never modify unless necessary)

## Entry Points

The library exposes multiple entry points:

- Root: `.` (main+types)
- `./resolver` — Unplugin resolver
- `./components` — All components
- `./composables` — All composables
- `./locales` — i18n files
- Plus granular per-item imports
