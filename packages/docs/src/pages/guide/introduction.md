# PXD

PXD is a universal UI component library for Vue 3.3+, with a built-in **agent bridge** that lets AI agents read your page and drive your components directly — no screenshots, no DOM dumps, no brittle click coordinates.

It ships 116 components and 26 composables covering layout, forms, navigation, overlays and data display, plus 11 dedicated primitives for AI and conversation interfaces.

Start with <RouterLink to="/guide/installation">Installation</RouterLink>, or jump to the <RouterLink to="/guide/agent">Agent guide</RouterLink> to see what the bridge can do.

## What you get

- **An agent bridge for your UI.** `pxd/agent` exposes your components through `snapshot` / `act` / `query`, with WebMCP registration, a per-step `allow` policy gate, secret redaction and observability. Components opt in, so it costs nothing until you import it.
- **Themes as plain CSS variables.** Light and dark live behind a single class, with no runtime style injection.
- **Motion you can switch off.** Disable every animation with `--duration: 0`, follow `prefers-reduced-motion`, and read the resolved preference from JavaScript.
- **Responsive beyond breakpoints.** Popovers become bottom sheets on small screens, backed by a built-in swipe gesture engine.
- **Primitives for AI interfaces.** Bubble, Reasoning, Tool Call, Mention, Command Menu, Stick To Bottom and more for chat UIs.
- **Lean and typed.** ESM-only with full tree-shaking, complete type definitions, a resolver for auto imports and Volar global component types.
- **Accessible.** Focus trapping with nested-dialog coordination, keyboard navigation and ARIA semantics.

## Agent bridge

Your components can drive themselves. With one call, an agent reads a structured view of the page, finds a component by label, row or kind, and runs actions on it — while a policy gate sees every step with its arguments and an abort signal. Disabled controls are refused, secret fields are redacted from snapshots and change streams, and `snapshot({ items: false })` keeps long option lists out of the model's context.

The same bridge powers `observe`, `elementOf`, `stageChanges` and `createHistory`, and can be registered as browser tools through WebMCP. Read the <RouterLink to="/guide/agent">Agent guide</RouterLink> for the full API and safety model.

## Where to go next

- <RouterLink to="/guide/installation">Installation</RouterLink> — add PXD to a project
- <RouterLink to="/guide/components">Components</RouterLink> — browse the component catalogue
- <RouterLink to="/guide/styled">Styled</RouterLink> — customize the design tokens
- <RouterLink to="/guide/agent">Agent</RouterLink> — read and drive your UI from an AI agent
- <RouterLink to="/guide/faq">FAQ</RouterLink> — common setup questions

## Examples

Working setups for Vite, Rsbuild, Webpack and other bundlers are kept in the [pxd-vue-examples](https://github.com/libondev/pxd-vue-examples){target="_blank"} repository.

## Acknowledgements

Many components and utilities were shaped by prior open source work; the site footer links to those projects (in no particular order, thank you 🙏🏻).
