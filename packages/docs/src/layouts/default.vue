<script setup lang="ts" generic="T extends { label: string, path: string }">

interface Props {
  menus: T[]
}

const props = defineProps<Props>()
</script>

<template>
  <div class="flex w-full h-full prose">
    <div class="w-72 p-3 border-x h-full bg-background-secondary">
      <slot name="sidebar" />
    </div>

    <div class="p-12 flex-1 h-full border-r">
      <slot />
    </div>
  </div>
</template>

<style lang="postcss">
.prose {
  line-height: 1.5625;

  :is(h1, h2, h3, h4) {
    font-weight: 500;
    position: relative;
    margin-bottom: 0.25em;

    &:not(:first-child) {
      margin-top: 1em;
    }
  }

  h2::before,
  h3::before,
  h4::before {
    position: absolute;
    left: 0;
    bottom: 4px;
    transform: translateX(-120%);
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

  p > code {
    font-size: 0.875rem;
    padding: 0.25em 0.5em;
    border-radius: 0.25em;
    background-color: var(--gray-alpha-200);
    border: 1px solid var(--gray-alpha-300);
  }

  a {
    text-decoration: underline;
    text-underline-offset: 0.1em;
  }
}
</style>
