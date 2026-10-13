# Use PXD

You are a coding agent. `agent-install.md` set PXD up in a project; this guide is what comes after — how to find out what the library does, and how to write code against it. Read a component's page before you use that component: its props, slots, events and exposed methods are stated there and nowhere else, and a prop name you guessed is a broken build.

## The two URLs

The documentation is served as raw Markdown, one file per page, so nothing you fetch carries the site around it:

- `__SITE_URL__/llms.txt` — the index: every guide, component and composable page, one line each, about 20 KB.
- Any page URL with `.md` appended — that page alone. Components are `/components/<name>.md`, composables `/composables/<name>.md`.

The rendered page answers at the same URL without the `.md`. Do not read it: it carries the same text wrapped in the site's layout, navigation and hydration payload.

## Find the page

Fetch `llms.txt`, then follow only the links you need. A component's file name is its own name without the `P` prefix, kebab-cased: `<PDatePicker>` is `/components/date-picker.md`, `<PApprovalCard>` is `/components/approval-card.md`, `<PInput>` is `/components/input.md`. Composables keep theirs: `useMessage` is `/composables/use-message.md`.

Three entries in the index — the home page, the component overview and the icon guide — point at rendered pages, because they are built from `.vue` files and have no Markdown source. Nothing you need for writing code is on them.

## Read the page

A component page opens with what the component is for, then `vue demo` blocks in the order the page wants you to meet them. Each block is real, runnable code with its template — copy it and adjust it rather than re-deriving the markup. The tables come last and they are the contract:

- `## Props` — name, type, default, meaning. Take the name exactly as it is written, kebab-case included.
- `## Slots` and `## Events` — what the component offers outward. Events are kebab-case, so an `update:modelValue` entry is `@update:model-value` in a template.
- `## Methods` — what a `ref` on the component exposes.
- A table named after a sub-component (`## ButtonGroup Props`) belongs to `<PButtonGroup>`: the page documents a family, not a single tag.

Composable pages have their own shape: `## Exports` for the signatures, `## Types` for the types those signatures mention, `## Params` for the options.

## What no single page tells you

- **`useMessage()` or `useLoadingBar()` on their own show nothing.** Each dispatches to a component that has to be mounted, and only to the one whose `group` matches the call's `group` — both sides default to `default`: `<PMessage group="..." />` and `<PLoadingBar group="..." />`.
- **Theming is the `.dark` class on `<html>`**, flipped by `<PThemeSwitcher />` or `useColorScheme()`, which persists the choice. Scale, locale and overlay motion go through `<PConfigProvider>`: `size` is `sm`, `md` or `lg` and is inherited by every descendant, `locale` takes one of `pxd/locales/*` and merges a partial object over `enUS`, `enter-motion` and `leave-motion` switch overlay transitions off.
- **Durations come from the `--duration` custom property** (0.2s by default), which drops to `0` on its own under `prefers-reduced-motion`. Set it to `0` for a build that never animates.
- **Popovers become bottom sheets on small screens**, so lay out against that rather than against a panel floating next to its trigger.
- **Entry points.** Components resolve from templates through the resolver; composables, locales and utils come from `pxd/composables/*`, `pxd/locales/*` and `pxd/utils/*`; anything else named is imported from `pxd`.

## When the pages and the installed version disagree

The site documents the latest release, the project may pin an older one. If a prop you read about is not there, the installed types are the truth: `node_modules/pxd/dist/components/<name>/index.d.vue.ts`, or the matching file under `node_modules/pxd/dist/composables/`.
