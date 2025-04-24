<script setup lang="ts" generic="T extends { label: string, path: string }">
interface Props {
  menus?: T[]
}

const {
  menus = [],
} = defineProps<Props>()
</script>

<template>
  <div class="absolute left-0 top-0">
    <div class="sidebar fixed top-12 mt-px z-10 h-screen border-r w-64 sm:border-x bg-background-secondary">
      <div class=" h-full overflow-y-auto p-2.5">
        <ul>
          <li v-for="menu of menus" :key="menu.path" class="mb-0.5">
            <PLinkButton variant="ghost" :href="menu.path" block>
              {{ menu.label }}
            </PLinkButton>
          </li>
        </ul>
      </div>
    </div>
  </div>

  <div class="prose ml-64 border-r flex-1 min-h-screen">
    <main class="p-16 h-full">
      <slot />
    </main>

    <SiteFooter />
  </div>
</template>

<style lang="postcss">
.sidebar .pxd-link-button.router-link-exact-active {
  border-color: hsl(var(--gray-300-value));
  pointer-events: none;
}

.prose {
  --background: var(--color-background);
  line-height: 1.68;

  :is(h1, h2, h3, h4) {
    font-weight: 500;
    position: relative;
    margin-bottom: 5px;

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
    transform: translateX(-110%) scale(0.8);
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
    padding: 0.15em 0.5em;
    border-radius: 0.25em;
    white-space: nowrap;
    background-color: var(--gray-alpha-200);
    border: 1px solid var(--gray-alpha-300);
  }

  a {
    text-decoration: underline;
    text-underline-offset: 0.1em;
  }

  hr {
    margin-block: 1.68em;
  }
}
</style>
