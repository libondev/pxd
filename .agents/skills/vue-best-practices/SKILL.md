---
name: vue-best-practices
description: Vue TypeScript, vue-tsc, Volar, component props typing, testing. Trimmed to the rules that apply to this dual Vue 2.7 + 3 component library.
license: MIT
metadata:
  author: hyf0
  version: '8.0.0'
---

# Vue Best Practices

Upstream rule set (hyf0/vue-best-practices v7.0.0), filtered down to what actually applies to this
repo. Dropped as irrelevant or contradictory here: `defineModel` (banned by AGENTS.md), Vue 3.5-only
APIs, Pinia, CSS modules, SSR/HMR, Vite plugin duplication, Volar 3 upgrade, editor-only settings,
and the `strictTemplates` pair (the option is not enabled in this repo). Restore any of them from
git history if that premise changes.

## Rules

| Rule                                                                            | Keywords                                            | Description                                     |
| ------------------------------------------------------------------------------- | --------------------------------------------------- | ----------------------------------------------- |
| [with-defaults-union-types](rules/with-defaults-union-types.md)                 | withDefaults, union type, default                   | Fix union type defaults                         |
| [fallthrough-attributes](rules/fallthrough-attributes.md)                       | fallthrough, $attrs, wrapper component              | Type-check fallthrough attributes               |
| [script-setup-jsdoc](rules/script-setup-jsdoc.md)                               | jsdoc, script setup, documentation                  | JSDoc on script setup (only when asked for docs) |
| [module-resolution-bundler](rules/module-resolution-bundler.md)                 | cannot find module, @vue/tsconfig, moduleResolution | Fix module resolution errors                    |
| [unplugin-auto-import-conflicts](rules/unplugin-auto-import-conflicts.md)       | unplugin, auto-import, types any                    | Fix unplugin type conflicts (docs workspace)    |
| [vue-router-typed-params](rules/vue-router-typed-params.md)                     | route params, typed router, unplugin                | Fix route params typing (docs workspace)        |

## Reference

- [Vue Language Tools](https://github.com/vuejs/language-tools)
- [Vue 3 Documentation](https://vuejs.org/)
