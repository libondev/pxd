<script setup lang="ts">
interface BookProps {
  title: string
  color?: string
  width?: number | string
  variant?: 'default' | 'simple'
}

withDefaults(
  defineProps<BookProps>(),
  {
    width: 196,
    variant: 'default',
  },
)
</script>

<template>
  <div class="pxd-book w-[--book-width] h-full" :style="{ '--book-width': `${width}px`, '--book-depth': '29cqw' }">
    <div />
    <div class="absolute top-1" style="height:calc(100% - 2 * 4px);width:calc(var(--book-depth) - 2px);transform:translateX(calc(var(--book-width) * 1px - var(--book-depth) / 2 - 3px)) rotateY(90deg) translateX(calc(var(--book-depth) / 2));background:linear-gradient(90deg,#eaeaea,transparent 70%),linear-gradient(#fff,#fafafa)" />
    <div class="absolute left-0 h-full bg-gray-200 rounded-[6px_4px_4px_6px]" style="transform:translateZ(calc(-1 * var(--book-depth)))" />
  </div>
</template>
