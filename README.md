# PXD

A universal UI component library for Vue 3.3+. Built-in light/dark theme, PC & mobile ready, animation-free mode supported. Ships with an **agent bridge** so AI agents can drive your UI.

[简体中文](README-CN.md) | [Online Preview](https://pxd.libondev.cn/)


> [!WARNING]
> The project is under active development and is not ready for production.

## Requirements

Requires Vue `>= 3.3`. See [Installation](https://pxd.libondev.cn/guide/installation) for the setup.

## Features

- 🤖 **Agent-ready**: `pxd/agent` exposes components to AI agents through `snapshot` / `act` / `query`, with WebMCP registration, a per-step `allow` policy gate, secret redaction and observability — see [Agent](https://pxd.libondev.cn/guide/agent)
- Theming: Light & dark themes as plain CSS variables, switching is a single class toggle
- Motion-safe: Turn off every animation with `--duration: 0`, or follow `prefers-reduced-motion`
- Responsive: Popovers become bottom sheets on small screens, with a built-in swipe gesture engine
- AI-ready: Bubble, Reasoning, ToolCall, Mention, CommandMenu and StickToBottom for chat UIs
- Lean: ESM-only, full tree-shaking
- Accessible: Focus trap with nested-dialog coordination, keyboard navigation and ARIA roles
- TypeScript: Full type definitions, resolver for auto imports and Volar global component types
- Inspired by the [Geist Design System](https://vercel.com/geist/introduction)

## Agent bridge

Your components can drive themselves. With one call, an AI agent reads the page and calls component actions directly — no screenshots, no DOM dumps, no brittle click coordinates.

```ts
import { createAgent, registerTools } from 'pxd/agent'

const agent = createAgent({
  // Called before every step. Refuse anything you don't want automated.
  allow: async ({ confirm, label, action, args }) => {
    if (confirm) return window.confirm(confirm) // data-agent-confirm steps need a person
    return true
  },
})

agent.snapshot()                        // structured view of the page
agent.query({ text: 'Display name' })   // find a component by label / row / kind
await agent.act({                       // run steps; returns values it changed
  steps: [{ ref: 'c1', action: 'setValue', args: ['Ada'] }],
})

registerTools(agent, { allow: step => true }) // also expose to browser agents via WebMCP
```

Built for real apps: a policy gate sees every step (with its args and an abort signal), disabled controls are refused, secret fields are redacted from snapshots and change streams, and `snapshot({ items: false })` keeps long option lists out of the model's context. `observe`, `elementOf`, `stageChanges` and `createHistory` are available on the same bridge. Components opt in, so the bridge costs nothing until you import it.

Read the [Agent guide](https://pxd.libondev.cn/guide/agent) for the full API and safety model.

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

- Components that can be used independently do not need to add -group/-item suffix, such as: `Checkbox`, `Avatar`, `Toggle`, `ToggleButton`
- Components that are used to manage a group of sub-components need to add -group suffix, such as: `CheckboxGroup`, `RadioGroup`, `ToggleButtonGroup`
- Components that can only be used as a sub-component of another component need to add -item suffix, such as: `ListItem`, `GridItem`, `MessageItem`

## Reference

- [Geist Design System](https://vercel.com/geist/introduction)
- [Figma(Community)](https://www.figma.com/design/1234567890/PXD-UI?node-id=0-1&t=1234567890-0)
