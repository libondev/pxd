<script setup>
import { useHead } from '@unhead/vue'
import { computed } from 'vue'
import componentList from '@/consts/components.json'
import composableList from '@/consts/composables.json'
import { githubLink, siteUrl } from '@/consts/link'

useHead({
  title: `PXD - One Codebase for Vue 2.7+ & Vue 3.2+`,
})

const INSTALL_COMMAND = 'pnpm install pxd'

const AGENT_INSTALL_PROMPT = `Read ${siteUrl}/agent-install.md and follow it to install the PXD component library in this project.`

const CAPABILITIES = [
  {
    title: 'One codebase, both versions',
    detail: 'The same source runs on Vue 2.7+ and Vue 3.2+ — nothing is maintained twice.',
  },
  {
    title: 'Light and dark themes',
    detail: 'Plain CSS variables behind a single class, with no runtime style injection.',
  },
  {
    title: 'Motion you can switch off',
    detail:
      'Disable every animation with one variable, or let the OS preference decide. Your JavaScript knows about it too.',
  },
  {
    title: 'Responsive beyond breakpoints',
    detail:
      'Popovers turn into bottom sheets on small screens, and a swipe gesture engine is built in.',
  },
  {
    title: 'AI and conversation primitives',
    detail:
      'Bubble, Reasoning, Tool Call, Mention, Command Menu and Stick To Bottom for chat interfaces.',
  },
  {
    title: 'Import only what you use',
    detail:
      'ESM-only with 7 runtime dependencies, a resolver for auto imports and full tree-shaking.',
  },
  {
    title: 'Accessible by default',
    detail:
      'Focus trap with nested-dialog coordination, keyboard navigation and ARIA roles throughout.',
  },
  {
    title: 'TypeScript, end to end',
    detail:
      'Full type definitions for every component and composable, plus a resolver and Volar global component types.',
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
</script>

<template>
  <main class="@container w-full">
    <section class="overflow-x-clip">
      <div class="gap-5 px-6 py-5 relative flex items-start">
        <span
          class="max-sm:hidden pt-3 shrink-0 basis-[132px] font-mono text-[10px] tracking-[0.06em] whitespace-nowrap text-foreground-secondary uppercase"
          >01 — One codebase</span
        >
        <h1
          class="font-semibold max-sm:whitespace-normal text-[clamp(32px,calc(10.2cqw_-_20.5px),148px)] leading-[0.94] tracking-[-0.045em] whitespace-nowrap"
        >
          One codebase.
        </h1>
      </div>

      <div
        class="gap-5 px-6 py-5 before:inset-x-0 before:top-0 relative flex items-start before:absolute before:h-px before:bg-gray-300 dark:before:bg-gray-400"
      >
        <span
          class="max-sm:hidden pt-3 shrink-0 basis-[132px] font-mono text-[10px] tracking-[0.06em] whitespace-nowrap text-foreground-secondary uppercase"
          >02 — Both versions</span
        >
        <h1
          class="font-semibold max-sm:whitespace-normal text-[clamp(32px,calc(10.2cqw_-_20.5px),148px)] leading-[0.94] tracking-[-0.045em] whitespace-nowrap"
        >
          Vue 2.7+ <span>&amp;</span> Vue 3.2+.
        </h1>
      </div>

      <div
        class="px-6 py-5 ps-50 max-sm:ps-6 before:inset-x-0 before:top-0 relative before:absolute before:h-px before:bg-gray-300"
      >
        <p class="max-w-[62ch] text-15 leading-[1.55] text-foreground-secondary">
          A universal UI component library: {{ componentList.length }} components and
          {{ composableList.length }} composables, built-in light/dark theme, PC &amp; mobile ready,
          and every animation can be turned off.
        </p>
      </div>
    </section>

    <section class="max-lg:grid-cols-2 max-md:grid-cols-1 grid grid-cols-4">
      <div
        class="px-6 py-4 max-lg:odd:border-s-0 max-lg:nth-[n+3]:border-t max-md:border-s-0 max-md:first:border-t-0 max-md:nth-[n+2]:border-t flex min-h-[74px] items-center border-y border-s first:border-s-0"
      >
        <PLinkButton shape="rounded" variant="primary" href="/guide/introduction">
          Get Started

          <template #suffix>
            <IconArrowRight />
          </template>
        </PLinkButton>
      </div>

      <div
        class="px-6 py-4 max-lg:odd:border-s-0 max-lg:nth-[n+3]:border-t max-md:border-s-0 max-md:nth-[n+2]:border-t flex min-h-[74px] items-center border-y border-s first:border-s-0"
      >
        <PLinkButton shape="rounded" :href="githubLink" target="_blank" external-icon>
          <template #prefix>
            <IconStarFill />
          </template>

          Star on GitHub
        </PLinkButton>
      </div>

      <div
        class="px-6 py-4 max-lg:odd:border-s-0 max-lg:nth-[n+3]:border-t max-md:border-s-0 max-md:nth-[n+2]:border-t flex min-h-[74px] items-center border-y border-s first:border-s-0"
      >
        <PSnippet aria-label="Copy install command" variant="secondary" :text="INSTALL_COMMAND" />
      </div>

      <div
        class="gap-0.5 px-6 py-2 max-lg:odd:border-s-0 max-lg:nth-[n+3]:border-t max-md:border-s-0 max-md:nth-[n+2]:border-t flex flex-col items-start justify-center border-y border-s first:border-s-0"
      >
        <span class="text-sm text-foreground-secondary">Want an agent to install it?</span>

        <PCopyButton
          aria-label="Copy AI prompt"
          size="sm"
          class="-ml-2 pr-2.5"
          variant="ghost"
          :text="AGENT_INSTALL_PROMPT"
        >
          Copy AI prompt
        </PCopyButton>
      </div>
    </section>

    <section class="border-b">
      <header class="gap-1 p-4 max-sm:flex-col flex items-baseline justify-between border-b">
        <h2 class="font-semibold text-13">Components</h2>
        <span class="font-mono text-11 text-foreground-secondary">{{ inventory }}</span>
      </header>

      <div class="px-4 gap-x-7 max-lg:columns-3 max-md:columns-2 columns-5">
        <div v-for="group in indexGroups" :key="group.label" class="pt-3.5 pb-4 break-inside-avoid">
          <h3
            class="font-normal font-mono text-[10px] tracking-[0.06em] text-foreground-secondary uppercase"
          >
            {{ group.label }}
          </h3>

          <ul class="-ms-1.5 gap-x-0.75 flex flex-wrap gap-y-px">
            <li v-for="item in group.children" :key="item.path">
              <RouterLink
                :to="item.path"
                class="px-1.5 inline-block rounded-sm py-px text-13 text-foreground no-underline hover:bg-gray-alpha-200 focus-visible:bg-gray-alpha-200 motion-safe:transition-colors"
                >{{ item.label }}</RouterLink
              >
            </li>
          </ul>
        </div>
      </div>
    </section>

    <section>
      <header class="gap-1 p-4 max-sm:flex-col flex items-baseline justify-between border-b">
        <h2 class="font-semibold text-13">What you get</h2>
        <span class="font-mono text-11 text-foreground-secondary"
          >{{ CAPABILITIES.length }} capabilities</span
        >
      </header>

      <div class="px-4">
        <table class="w-full border-collapse">
          <tbody>
            <tr v-for="capability in CAPABILITIES" :key="capability.title" class="border-b">
              <th
                scope="row"
                class="w-60 max-md:w-40 pe-5 py-3.5 font-medium text-start align-top text-13"
              >
                {{ capability.title }}
              </th>
              <td class="py-3.5 max-w-[68ch] align-top text-13 text-foreground-secondary">
                {{ capability.detail }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </main>
</template>

<route lang="yaml">
meta:
  layout: false
</route>
