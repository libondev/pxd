<script lang="ts" setup>
import { PRESET_MEDIA_QUERIES, useMediaQuery } from 'pxd/composables/use-media-query'
import { humanize } from 'pxd/utils/format'
import { isServer } from 'pxd/utils/is'
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { githubLink } from '@/consts/link'
import Menus from '../../components/Menus.vue'
import TocNav from '../../components/TocNav.vue'

interface MenuItem {
  label: string
  path: string
}

interface MenuGroup {
  group: string
  children: MenuItem[]
}

type Menu = MenuItem | MenuGroup

interface Props {
  menus?: Menu[]
}

const { menus = [] } = defineProps<Props>()

const route = useRoute()

const isMdUp = useMediaQuery(PRESET_MEDIA_QUERIES.MD_UP)

const showViewSource = computed(() => {
  const { name } = route
  return (name.startsWith('/components') || name.startsWith('/composables')) && !name.endsWith('/')
})

const flattenedMenus = computed(() => {
  const _menus = menus.flatMap((menu) => {
    if ('children' in menu) {
      return menu.children
    }

    return menu
  })

  return _menus
})

const paginationData = computed(() => {
  const index = flattenedMenus.value.findIndex((menu) => menu.path === route.path)
  const prev = flattenedMenus.value[index - 1]
  const next = flattenedMenus.value[index + 1]

  return {
    prev: prev && {
      label: prev.label,
      href: prev.path,
    },
    next: next && {
      label: next.label,
      href: next.path,
    },
  }
})

const componentSourcePath = computed(() => `${githubLink}/blob/dev/src${route.path}/index.vue`)

if (!isServer()) {
  watch(
    () => route.path,
    () => {
      document.title = `${humanize(route.path.split('/').pop()!)} - PXD`
    },
    { immediate: true },
  )
}
</script>

<template>
  <div v-if="isMdUp" class="left-0 top-0 bottom-0 absolute">
    <aside class="sidebar top-12 bottom-0 w-56 xl:border-l fixed z-0 border-r bg-background-100">
      <PScrollable class="h-full" content-class="p-2.5" fader-direction="vertical">
        <Menus :menus="menus" />
      </PScrollable>
    </aside>
  </div>

  <div class="md:pl-56 lg:pr-56 flex min-h-[calc(100vh-50px)] w-full max-w-full flex-1 flex-col">
    <main class="prose px-6 py-12 w-full flex-1 motion-safe:transition-[padding]">
      <slot />

      <template v-if="showViewSource">
        <h2 id="source" class="mb-4" tabindex="-1">
          <a class="header-anchor" href="#source">Source</a>
        </h2>

        <PLinkButton :href="componentSourcePath" external-icon target="_blank" text="Source" />
      </template>

      <div class="mt-16 -mx-2">
        <PPagination :prev="paginationData.prev" :next="paginationData.next" />
      </div>
    </main>

    <SiteFooter />
  </div>

  <div class="right-0 top-0 bottom-0 w-56 lg:block absolute hidden">
    <aside class="toc-aside top-12 w-56 bottom-0 fixed z-0 border-x bg-background-100 empty:hidden">
      <TocNav />
    </aside>
  </div>
</template>

<style lang="postcss">
.sidebar .pxd-link-button.router-link-exact-active {
  background-color: var(--color-background-200);
  border-color: var(--color-gray-300);
  pointer-events: none;
}

.noticeboard {
  line-height: 1.5 !important;
}

.prose,
.markdown-body {
  --background: var(--color-background-100);
  line-height: 1.5;

  & > :is(h1, h2, h3, h4) {
    font-weight: 600;
    position: relative;
    letter-spacing: -0.03em;
    outline: none;

    & > a {
      outline: none;
      outline-offset: 2px;

      &:focus-visible {
        outline: 2px solid hsl(var(--ring));
      }
    }

    &:not(:first-child) {
      margin-top: 2em;
    }

    & + p {
      margin-top: 0;
    }

    &:hover::before {
      content: '#';
    }
  }

  & > h1::before,
  & > h2::before,
  & > h3::before,
  & > h4::before {
    position: absolute;
    left: -2px;
    transform: translateX(-100%) scale(0.75);
    font-weight: 500;
    color: hsl(var(--color-gray-800-value));
  }

  & > h1 {
    font-size: 1.875rem;
  }

  & > h2 {
    font-size: 1.5rem;
  }

  & > h3 {
    font-size: 1.25rem;
  }

  & > h4 {
    font-size: 1.125rem;
  }

  blockquote {
    padding-left: 1em;
    padding-block: 1px;
    border-left: 4px solid var(--color-gray-alpha-300);
    background-color: var(--color-gray-alpha-100);

    p {
      margin-block: 0.25em;
    }
  }

  ul:not([class*='pxd-']) {
    padding-left: 2em;
    list-style-type: auto;
  }

  li:not([class*='pxd-']) {
    margin-block: 0.5em;
  }

  hr {
    margin-block: 1.68em;
  }

  p:not([class*='pxd-']) {
    margin-block: 0.5em;
  }

  .markdown-body > pre:not(.shiki) {
    padding-left: 1.25em;
    margin-block: 1em;
    border-radius: var(--radius);

    code {
      white-space: pre-wrap;
      word-break: break-word;
    }
  }

  pre.shiki {
    position: relative;
    max-width: 100%;
    margin-block: 1em;
    padding: 1.25em 1.5em;
    line-height: 1.25;
    border-radius: 0.5em;
    word-break: break-all;
    border: 1px solid hsl(var(--color-gray-300-value));
    outline: none;
    overflow: auto;

    &:has(.line:not(:only-child)) {
      padding: 1.25em 0;
    }
  }

  pre code {
    max-width: 100%;
    font-size: 0.875rem;
  }

  pre.shiki > code {
    counter-reset: section;
  }

  pre.shiki code .line {
    position: relative;
  }

  pre.shiki code .line:not(:only-child) {
    &::before {
      content: counter(section);
      display: inline-block;
      position: sticky;
      top: 0;
      left: 0;
      width: 50px;
      padding-right: 1em;
      user-select: none;
      text-align: right;
      pointer-events: none;
      color: var(--color-gray-600);
      counter-increment: section;
      background: linear-gradient(to right, var(--color-background-100) 80%, transparent);
      z-index: 1;
    }

    &::after {
      content: ' ';
      position: sticky;
      right: -1px;
      top: 0;
      display: inline-block;
      width: 1.5rem;
      height: 100%;
      pointer-events: none;
      background: linear-gradient(to left, var(--color-background-100) 35%, transparent);
      z-index: 0;
    }
  }

  pre.shiki code.language-bash .line:not(:only-child)::before {
    content: '$';
    color: var(--color-gray-600);
  }

  h2#props + table {
    border-collapse: collapse;
    table-layout: fixed;
    width: 100%;
    border-color: hsl(var(--color-gray-300-value));
    border-width: 0 0 1px 1px;
    margin-block: 1.68em;
    font-size: 14px;

    th {
      font-weight: 500;
      text-align: left;
    }

    tr {
      border-top: 1px solid hsl(var(--color-gray-300-value));
    }

    th,
    td {
      padding: 0.75em 1em;
      border-right: 1px solid hsl(var(--color-gray-300-value));
    }
  }
}

.shiki,
.shiki span {
  background-color: transparent !important;
}

html.dark .shiki,
html.dark .shiki span {
  color: var(--shiki-dark) !important;
  font-style: var(--shiki-dark-font-style) !important;
  font-weight: var(--shiki-dark-font-weight) !important;
  text-decoration: var(--shiki-dark-text-decoration) !important;
}
</style>
