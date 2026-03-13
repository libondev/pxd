# PXD

A Vue 2.7 & 3.2 universal component library. Built-in light/dark theme. PC & mobile ready. Animation-free mode supported.

[简体中文](README-CN.md) | [Online Preview](https://pxd-ui.netlify.app/)


> [!WARNING]
> The project is under active development and is not ready for production.

## Features

- Universal: One codebase for Vue 2.7+ and Vue 3.2+
- Responsive: Seamlessly works on both PC and mobile devices
- Built-in light & dark theme, no extra configuration needed
- Motion-safe: Supports fully disabling all animations
- Written in TypeScript with full type definitions
- Vue 3 Composition API with `<script setup>`
- Complete tree-shaking support
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
