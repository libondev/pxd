<script setup>
import { useHead } from '@unhead/vue'
import { useIntersectionObserver } from 'pxd/composables/use-intersection-observer'
import { computed, shallowRef } from 'vue'
import componentList from '@/consts/components.json'
import composableList from '@/consts/composables.json'
import { githubLink } from '@/consts/link'

useHead({
  title: `PXD - One Codebase for Vue 2.7+ & Vue 3.2+`,
})

const INSTALL_COMMAND = 'pnpm install pxd'

const CAPABILITIES = [
  {
    title: 'One codebase, both versions',
    detail: 'The same source runs on Vue 2.7+ and Vue 3.2+ — nothing is maintained twice.',
    key: 'vue-demi',
  },
  {
    title: 'Light and dark themes',
    detail: 'Plain CSS variables behind a single class, with no runtime style injection.',
    key: '.dark',
  },
  {
    title: 'Motion you can switch off',
    detail:
      'Disable every animation with one variable, or let the OS preference decide. Your JavaScript knows about it too.',
    key: '--duration: 0',
  },
  {
    title: 'Responsive beyond breakpoints',
    detail:
      'Popovers turn into bottom sheets on small screens, and a swipe gesture engine is built in.',
    key: '',
  },
  {
    title: 'AI and conversation primitives',
    detail:
      'Bubble, Reasoning, Tool Call, Mention, Command Menu and Stick To Bottom for chat interfaces.',
    key: '',
  },
  {
    title: 'Import only what you use',
    detail:
      'ESM-only with 7 runtime dependencies, a resolver for auto imports and full tree-shaking.',
    key: '',
  },
  {
    title: 'Accessible by default',
    detail:
      'Focus trap with nested-dialog coordination, keyboard navigation and ARIA roles throughout.',
    key: '',
  },
  {
    title: 'TypeScript, end to end',
    detail:
      'Full type definitions for every component and composable, plus a resolver and Volar global component types.',
    key: '',
  },
]

const componentGroups = computed(() => {
  const groups = new Map()

  for (const { camelized, name, category } of componentList) {
    const children = groups.get(category) || []
    children.push({ label: camelized, path: `/components/${name}` })
    groups.set(category, children)
  }

  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, children]) => ({ label, children }))
})

const indexGroups = computed(() => [
  ...componentGroups.value,
  {
    label: 'Composables',
    children: composableList.map(({ name }) => ({ label: name, path: `/composables/${name}` })),
  },
])

const inventory = computed(
  () =>
    `${componentList.length} components · ${composableList.length} composables · ${componentGroups.value.length} categories`,
)

const indexEl = shallowRef(null)
const isIndexDrawn = shallowRef(false)

useIntersectionObserver(
  indexEl,
  ([item]) => {
    if (item?.entry.isIntersecting) {
      isIndexDrawn.value = true
    }
  },
  { rootMargin: '0px 0px -10% 0px' },
)
</script>

<template>
  <main class="home">
    <section class="hero">
      <div class="ruled">
        <span class="gutter">01 — One codebase</span>
        <h1 class="display">One codebase.</h1>
      </div>

      <div class="ruled">
        <span class="gutter">02 — Both versions</span>
        <h1 class="display">Vue 2.7+ <span class="amp">&amp;</span> Vue 3.2+.</h1>
      </div>

      <div class="lede">
        <p>
          A universal UI component library: {{ componentList.length }} components and
          {{ composableList.length }} composables, built-in light/dark theme, PC &amp; mobile ready,
          and every animation can be turned off.
        </p>
      </div>
    </section>

    <section class="bar">
      <div class="bar-cell">
        <PLinkButton shape="rounded" variant="primary" href="/guide/introduction">
          Get Started

          <template #suffix>
            <IconArrowRight />
          </template>
        </PLinkButton>
      </div>

      <div class="bar-cell">
        <PLinkButton shape="rounded" :href="githubLink" target="_blank" external-icon>
          <template #prefix>
            <IconStarFill />
          </template>

          Star on GitHub
        </PLinkButton>
      </div>

      <div class="bar-cell">
        <span class="command">
          <span class="prompt">$</span>
          <span class="command-text">{{ INSTALL_COMMAND }}</span>

          <PCopyButton
            :text="INSTALL_COMMAND"
            variant="ghost"
            shape="square"
            size="sm"
            aria-label="Copy install command"
          />
        </span>
      </div>
    </section>

    <section ref="indexEl" class="index" :data-drawn="isIndexDrawn || undefined">
      <header class="sec-head">
        <h2>Components</h2>
        <span class="tally">{{ inventory }}</span>
      </header>

      <div class="index-cols">
        <div
          v-for="(group, i) in indexGroups"
          :key="group.label"
          class="group"
          :style="{ '--i': i }"
        >
          <h3 class="group-label">{{ group.label }}</h3>

          <ul>
            <li v-for="item in group.children" :key="item.path">
              <RouterLink :to="item.path">{{ item.label }}</RouterLink>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <section class="spec">
      <header class="sec-head">
        <h2>What you get</h2>
        <span class="tally">{{ CAPABILITIES.length }} capabilities</span>
      </header>

      <table>
        <tbody>
          <tr v-for="capability in CAPABILITIES" :key="capability.title">
            <th scope="row">{{ capability.title }}</th>
            <td>
              {{ capability.detail }}

              <code v-if="capability.key">{{ capability.key }}</code>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </main>
</template>

<style lang="postcss">
.home {
  /* Type scales with the measure rather than the viewport, so a line always fills the measure.
     The explicit width is required: inline-size containment otherwise drops the flex item's
     intrinsic width and collapses the page. */
  container-type: inline-size;
  width: 100%;

  --home-fg: var(--color-gray-900);
  --home-muted: var(--color-gray-900);
  --home-accent: var(--color-gray-700);
}

.dark .home {
  --home-fg: var(--color-gray-1000);
  --home-muted: var(--color-gray-800);
  --home-accent: var(--color-gray-800);
}

.hero {
  /* A fallback font can be wider than Inter; clip instead of scrolling the page. */
  overflow-x: clip;
}

.ruled {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 20px;
  padding: 16px 24px 24px;

  &::before {
    content: '';
    position: absolute;
    inset-block-start: 0;
    inset-inline: 0;
    height: 1px;
    background-color: var(--color-gray-300);
    transform-origin: left;
    animation: rule-draw calc(var(--duration) * 2) var(--timing-function) both;
  }

  &:first-child::before {
    display: none;
  }

  &:nth-child(2)::before {
    animation-delay: calc(var(--duration) * 0.35);
  }
}

.dark .ruled::before {
  background-color: var(--color-gray-400);
}

.gutter {
  flex: 0 0 132px;
  padding-block-start: 12px;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--home-muted);
  white-space: nowrap;
}

.display {
  font-size: clamp(32px, calc(10.2cqw - 20.5px), 148px);
  font-weight: 600;
  letter-spacing: -0.045em;
  line-height: 0.94;
  white-space: nowrap;
  animation: display-rise calc(var(--duration) * 2) var(--timing-function) both;
}

.dark .display {
  animation-delay: calc(var(--duration) * 0.35);
}

.display .amp {
  color: var(--home-accent);
}

.lede {
  padding: 20px 24px 26px 176px;
  animation: display-rise calc(var(--duration) * 2) var(--timing-function) both;
  animation-delay: calc(var(--duration) * 0.7);

  p {
    max-width: 62ch;
    font-size: 15px;
    line-height: 1.55;
    color: var(--home-muted);
  }
}

.bar {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  border-block: 1px solid var(--color-gray-300);
  animation: display-rise calc(var(--duration) * 2) var(--timing-function) both;
  animation-delay: calc(var(--duration) * 1.05);
}

.dark .bar {
  border-color: var(--color-gray-400);
}

.bar-cell {
  display: flex;
  align-items: center;
  min-height: 74px;
  padding: 16px 24px;
  border-inline-start: 1px solid var(--color-gray-300);

  &:first-child {
    border-inline-start: 0;
  }
}

.dark .bar-cell {
  border-color: var(--color-gray-400);
}

.command {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 4px 4px 4px 12px;
  background-color: var(--color-background-200);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--radius);
  font-family: var(--font-mono);
  font-size: 12.5px;
  color: var(--home-fg);
}

.dark .command {
  border-color: var(--color-gray-400);
}

.prompt {
  color: var(--home-muted);
}

.command-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.command .pxd-button {
  flex-shrink: 0;
}

.sec-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
  padding-block-end: 16px;
  border-block-end: 1px solid var(--color-gray-300);

  h2 {
    font-size: 13px;
    font-weight: 600;
  }
}

.dark .sec-head {
  border-color: var(--color-gray-400);
}

.tally {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--home-muted);
}

.index {
  padding: 76px 24px 0;
}

.index-cols {
  columns: 5;
  column-gap: 28px;
}

.group {
  break-inside: avoid;
  padding-block: 14px 15px;

  ul {
    display: flex;
    flex-wrap: wrap;
    gap: 1px 3px;
    list-style: none;
    padding: 0;
    margin: 0;
  }

  a {
    display: inline-block;
    padding: 1px 6px;
    border-radius: var(--radius-sm);
    font-size: 13px;
    color: var(--home-fg);
    text-decoration: none;
    transition:
      background-color var(--duration) var(--timing-function),
      color var(--duration) var(--timing-function);

    &:hover,
    &:focus-visible {
      background-color: var(--color-background-200);
      color: var(--color-foreground);
    }
  }
}

.dark .group::after {
  background-color: var(--color-gray-400);
}

.group-label {
  margin-block-end: 7px;
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 400;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--home-muted);
  transition: color var(--duration) var(--timing-function);
}

.index[data-drawn] .group {
  .group-label {
    color: var(--color-gray-1000);
    animation: display-rise calc(var(--duration) * 2) var(--timing-function) both;
    animation-delay: calc(var(--i, 0) * var(--duration) * 0.3 + var(--duration) * 0.8);
  }
}

.spec {
  padding: 76px 24px 0;

  table {
    width: 100%;
    border-collapse: collapse;
  }

  tr {
    border-block-end: 1px solid var(--color-gray-300);
  }

  th {
    text-align: left;
    vertical-align: top;
    width: 240px;
    padding: 14px 20px 14px 0;
    font-size: 13px;
    font-weight: 500;
  }

  td {
    vertical-align: top;
    padding-block: 14px;
    font-size: 13px;
    color: var(--home-muted);
    /* Keeps the description readable once the viewport outgrows the container. */
    max-width: 68ch;
  }

  code {
    margin-inline-start: 0.5em;
    white-space: nowrap;
  }
}

.dark .spec tr {
  border-color: var(--color-gray-400);
}

@keyframes display-rise {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
}

@media (max-width: 64rem) {
  .index-cols {
    columns: 3;
  }
}

@media (max-width: 48rem) {
  .bar {
    grid-template-columns: minmax(0, 1fr);
  }

  .bar-cell {
    border-inline-start: 0;
    border-block-start: 1px solid var(--color-gray-300);

    &:first-child {
      border-block-start: 0;
    }
  }

  .dark .bar-cell {
    border-color: var(--color-gray-400);
  }

  .index-cols {
    columns: 2;
  }

  .spec th {
    width: 160px;
  }
}

@media (max-width: 40rem) {
  .gutter {
    display: none;
  }

  .display {
    white-space: normal;
  }

  .lede {
    padding-inline: 24px;
  }

  .index,
  .spec {
    padding-block-start: 56px;
  }
}
</style>

<route lang="yaml">
meta:
  layout: false
</route>
