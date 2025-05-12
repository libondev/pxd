<script setup lang="ts" generic="T extends { label: string, path: string }">
interface Props {
  menus?: T[]
}

const {
  menus = [],
} = defineProps<Props>()
</script>

<template>
  <div class="absolute left-0 top-0 bottom-0">
    <div class="sidebar fixed -translate-x-full sm:translate-x-0 top-12 bottom-0 mt-px z-10 border-r w-64 sm:border-x bg-background-secondary">
      <PScrollable class="h-full overflow-y-auto p-2.5">
        <ul>
          <li v-for="menu of menus" :key="menu.path" class="mb-0.5">
            <PLinkButton variant="ghost" :href="menu.path" block>
              {{ menu.label }}
            </PLinkButton>
          </li>
        </ul>
      </PScrollable>
    </div>
  </div>

  <div class="sm:ml-64 border-r w-full max-w-full flex-1 min-h-screen">
    <main class="prose px-6 sm:px-20 py-16 h-full">
      <slot />
    </main>

    <SiteFooter />
  </div>
</template>

<style lang="postcss">
.sidebar .pxd-link-button.router-link-exact-active {
  border-color: var(--color-gray-300);
  pointer-events: none;
}

.noticeboard {
  line-height: 1.5 !important;
}

.prose {
  --background: var(--color-background);
  line-height: 1.5;

  :is(h1, h2, h3, h4) {
    font-weight: 500;
    position: relative;
    margin-bottom: .25em;

    &:not(:first-child) {
      margin-top: 1.68em;
    }

    & + p {
      margin-top: 0;
    }
  }

  h2::before,
  h3::before,
  h4::before {
    position: absolute;
    left: 0;
    bottom: 4px;
    transform: translateX(-100%) scale(0.75);
    font-size: 12px;
    font-weight: 500;
    color: var(--color-muted);
  }

  h2::before {
    content: 'h2';
  }

  h3::before {
    content: 'h3';
  }

  h4::before {
    content: 'h4';
  }

  h1 {
    font-size: 1.875rem;
  }

  h2 {
    font-size: 1.5rem;
  }

  h3 {
    font-size: 1.25rem;
  }

  h4 {
    font-size: 1.125rem;
  }

  blockquote {
    padding-left: 1em;
    padding-block: 1px;
    border-left: 4px solid var(--gray-alpha-300);
    background-color: var(--gray-alpha-100);

    p {
      margin-block: 0.25em;
    }
  }

  ul {
    padding-left: 2em;
    list-style-type: auto;
  }

  li {
    margin-block: 0.5em;
  }

  hr {
    margin-block: 1.68em;
  }

  p {
    margin-block: .75em;
  }

  a:not(.pxd-link-button) {
    font-weight: 500;
    text-decoration: underline;
    text-underline-offset: 0.1em;
  }

  pre.shiki {
    padding: 1.25em 3.25em;
    line-height: 1.25;
  }

  .markdown-body > pre:not(.shiki) {
    padding-left: 1.25em;
    margin-block: 1em;
    border-radius: var(--radius);
  }

  pre code {
    max-width: 100%;
    font-size: 0.875rem;
    /* white-space: pre-wrap;
    word-break: break-word; */
  }

  pre.shiki > code {
    counter-reset: section;
  }

  pre.shiki code .line {
    position: relative;
  }

  pre.shiki code .line:not(:last-child)::before {
    content: counter(section);
    position: absolute;
    top: 0;
    left: -2.75em;
    width: 25px;
    user-select: none;
    text-align: right;
    pointer-events: none;
    color: var(--color-gray-600);
    counter-increment: section;
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
