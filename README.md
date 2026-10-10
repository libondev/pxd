# PXD

A universal UI component library: one codebase for Vue 2.7+ & Vue 3.2+. Built-in light/dark theme, PC & mobile ready, animation-free mode supported.

[简体中文](README-CN.md) | [Online Preview](https://pxd-ui.netlify.app/)


> [!WARNING]
> The project is under active development and is not ready for production.

## Features

- Universal: One codebase for Vue 2.7+ and Vue 3.2+, no `vue-demi` and no duplicated source
- Theming: Light & dark themes as plain CSS variables, switching is a single class toggle
- Motion-safe: Turn off every animation with `--duration: 0`, or follow `prefers-reduced-motion`
- Responsive: Popovers become bottom sheets on small screens, with a built-in swipe gesture engine
- AI-ready: Bubble, Reasoning, ToolCall, Mention, CommandMenu and StickToBottom for chat UIs
- Lean: Only 7 runtime dependencies, ESM-only, full tree-shaking
- Accessible: Focus trap with nested-dialog coordination, keyboard navigation and ARIA roles
- TypeScript: Full type definitions, resolver for auto imports and Volar global component types
- Inspired by the [Geist Design System](https://vercel.com/geist/introduction)

## Contribution

### Dev

```shell
pnpm install

pnpm dev
```

### Build

#### Core only

```shell
pnpm build:lib
```

#### Docs only

```shell
pnpm build:docs
```

#### Deploy

```shell
pnpm build
```

## Contribution Guidelines

### Component Naming Rules

- Components that can be used independently do not need to add -group/-item suffix, such as: `Checkbox`, `Radio`, `Toggle`, `ToggleButton`
- Components that are used to manage a group of sub-components need to add -group suffix, such as: `CheckboxGroup`, `RadioGroup`, `ToggleGroup`, `ToggleButtonGroup`
- Components that can only be used as a sub-component of another component need to add -item suffix, such as: `ListItem`, `GridItem`, `MessageItem`

## Reference

- [Geist Design System](https://vercel.com/geist/introduction)
- [Figma(Community)](https://www.figma.com/design/1234567890/PXD-UI?node-id=0-1&t=1234567890-0)
