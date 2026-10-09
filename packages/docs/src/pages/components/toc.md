# Toc

Renders an outline of the headings in your page, tracks which one the reader is currently on, and scrolls to a heading on activation.

## Default

Point `selector` at the container that holds your content. The `>` combinator matters: a heading nested one level deeper, inside a demo or a callout, is not part of the outline and a descendant selector would list it anyway.

```vue demo
<script setup>
import { ref } from 'vue'

const viewport = ref(null)
</script>

<template>
  <div class="flex items-start gap-6">
    <PToc :selector="'.demo-basic > :is(h2, h3)[id]'" :scroll-target="viewport" class="w-40 shrink-0" />

    <div ref="viewport" class="max-h-72 flex-1 overflow-y-auto rounded-lg border p-4">
      <div class="demo-basic">
        <h2 id="basic-install">Install</h2>
        <p class="text-foreground-secondary">
          Filler so that the headings can travel across the probe line.
        </p>

        <h3 id="basic-configure">Configure</h3>
        <p class="text-foreground-secondary">
          A nested heading is indented one step further than the shallowest heading in the list.
        </p>

        <h2 id="basic-usage">Usage</h2>
        <p class="text-foreground-secondary">
          Scrolling back up hands the highlight to the previous heading as soon as it crosses the probe
          line.
        </p>

        <h3 id="basic-events">Events</h3>
        <p class="text-foreground-secondary">
          The last entry stays reachable even when its section is too short to scroll up to the probe line.
        </p>
      </div>
    </div>
  </div>
</template>
```

## Offset

`offset` is the single source of truth for both directions: the component scrolls the heading to `offset` pixels below the top of the scroll container, and uses the same line to decide which entry is active. Set it to the height of a sticky header so the heading is never hidden underneath it.

```vue demo
<script setup>
import { ref } from 'vue'

const viewport = ref(null)
</script>

<template>
  <div class="flex items-start gap-6">
    <PToc
      :selector="'.demo-offset > h2[id]'"
      :scroll-target="viewport"
      :offset="24"
      label="Sections"
      class="w-40 shrink-0"
    />

    <div ref="viewport" class="max-h-56 flex-1 overflow-y-auto rounded-lg border p-4">
      <div class="demo-offset">
        <h2 id="offset-a">Section A</h2>
        <p class="text-foreground-secondary">Filler so that the headings can travel across the probe line.</p>

        <h2 id="offset-b">Section B</h2>
        <p class="text-foreground-secondary">Filler so that the headings can travel across the probe line.</p>

        <h2 id="offset-c">Section C</h2>
        <p class="text-foreground-secondary">Filler so that the headings can travel across the probe line.</p>
      </div>
    </div>
  </div>
</template>
```

## Custom Item

Use the `item` slot to render an entry yourself. The slot receives the entry, its position, its depth relative to the shallowest heading, whether it is the active one, and a `select` handler. A slot replaces the default anchor entirely, so the indent is yours to set and `select` is what keeps the offset-aware scroll.

```vue demo
<script setup>
import { ref } from 'vue'

const viewport = ref(null)
</script>

<template>
  <div class="flex items-start gap-6">
    <PToc :selector="'.demo-slot > :is(h2, h3)[id]'" :scroll-target="viewport" class="w-40 shrink-0">
      <template #item="{ item, depth, active, select }">
        <a
          :href="`#${item.id}`"
          class="block truncate rounded-md border-l-2 py-1.5 pe-2 text-start no-underline"
          :class="[
            depth ? 'pl-6' : 'pl-3',
            active
              ? 'border-primary bg-gray-alpha-100 font-medium text-primary'
              : 'border-transparent text-foreground-secondary hover:bg-gray-alpha-100',
          ]"
          :aria-current="active ? 'location' : undefined"
          @click="select"
        >
          {{ item.label }}
        </a>
      </template>
    </PToc>

    <div ref="viewport" class="max-h-56 flex-1 overflow-y-auto rounded-lg border p-4">
      <div class="demo-slot">
        <h2 id="slot-alpha">Alpha</h2>
        <p class="text-foreground-secondary">Filler so that the headings can travel across the probe line.</p>

        <h3 id="slot-beta">Beta</h3>
        <p class="text-foreground-secondary">Filler so that the headings can travel across the probe line.</p>
      </div>
    </div>
  </div>
</template>
```

## Minimal Rail

A slot replaces the whole entry, so it also owns the indent. Render nothing but a small bar, and reveal the label on hover or keyboard focus. `select` keeps the offset-aware scroll that the default entry has — call it from your own click handler.

```vue demo
<script setup>
import { ref } from 'vue'

const viewport = ref(null)
</script>

<template>
  <div class="flex items-start gap-6">
    <PToc :selector="'.demo-rail > :is(h2, h3)[id]'" :scroll-target="viewport" class="w-6 shrink-0">
      <template #item="{ item, active, select }">
        <a
          :href="`#${item.id}`"
          :aria-label="item.label"
          :aria-current="active ? 'location' : undefined"
          class="group relative flex h-5 items-center rounded-sm p-1 no-underline self-focus-ring outline-none"
          @click="select"
        >
          <span
            class="h-1 rounded-full motion-safe:transition-all motion-safe:duration-150"
            :class="active ? 'w-5 bg-primary' : 'w-2.5 bg-gray-400 group-hover:w-5 group-hover:bg-gray-700'"
          />

          <span
            class="pointer-events-none absolute start-7 z-10 rounded-md bg-gray-900 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 motion-safe:transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
          >
            {{ item.label }}
          </span>
        </a>
      </template>
    </PToc>

    <div ref="viewport" class="max-h-56 flex-1 overflow-y-auto rounded-lg border p-4">
      <div class="demo-rail">
        <h2 id="rail-start">Getting started</h2>
        <p class="text-foreground-secondary">Filler so that the headings can travel across the probe line.</p>

        <h3 id="rail-install">Installation</h3>
        <p class="text-foreground-secondary">Filler so that the headings can travel across the probe line.</p>

        <h3 id="rail-config">Configuration</h3>
        <p class="text-foreground-secondary">Filler so that the headings can travel across the probe line.</p>

        <h2 id="rail-deploy">Deployment</h2>
        <p class="text-foreground-secondary">Filler so that the headings can travel across the probe line.</p>
      </div>
    </div>
  </div>
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| selector | `string` | - | Headings that make up the outline, as a CSS selector matched inside `scroll-target` (or the document). Re-read when it changes, and when that subtree mutates. |
| scroll-target | `HTMLElement \| null` | `null` | Scrollable container holding the headings; the outline is read and watched inside it. Leave empty to read the document. |
| offset | `number` | `0` | Pixels kept above the heading when scrolling to it, and the probe line used to detect the active entry. |
| scroll-behavior | `'auto' \| 'instant' \| 'smooth'` | `'auto'` | Scroll animation when an entry is activated; `auto` follows the system motion preference. |
| scroll-active-into-view | `boolean` | `true` | Scroll the active entry back into view when it leaves the list. |

## Events

| Name | Type | Description |
| --- | --- | --- |
| item-click | `(item: TocItem, event: MouseEvent) => void` | Emitted when the user activates an entry. |
| active-change | `(item: TocItem \| null) => void` | Emitted when the active heading changes. |

```ts
interface TocItem {
  /** `id` of the heading element this entry scrolls to. */
  id: string
  /** Text content of the heading, with a leading `#` permalink stripped. */
  label: string
  /** Heading level parsed from the tag name, 1-6. */
  level: number
}
```

## Slots

| Name | Description |
| --- | --- |
| item | Entry renderer, replacing the default anchor and its indent. Slot props: `item`, `index`, `depth`, `active`, `select`. Bind `select` to your own click handler to keep the offset-aware scroll. |

## Methods

| Name | Type | Description |
| --- | --- | --- |
| activeId | `string \| null` | The id of the entry that is currently highlighted. |
| items | `TocItem[]` | The outline the component read from `scroll-target` (or the document). |
| scrollTo | `(id: string) => boolean` | Scroll to the entry with the given id, returning whether it was found. |
| update | `() => void` | Recompute the highlighted entry from the current layout. |
