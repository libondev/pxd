<script lang="ts" setup>
</script>

<template>
  <div class="code-block">
    <div>
      <slot />
    </div>

    <details class="code-block">
      <summary class="flex items-center">
        <IconArrowRight />
      </summary>

      <div>
        <slot name="code" />
      </div>
    </details>
  </div>
</template>
