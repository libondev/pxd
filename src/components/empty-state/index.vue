<script lang="ts" setup>
interface Props {
  title?: string
  description?: string
}

defineOptions({
  name: 'PEmptyState',
})

defineProps<Props>()
</script>

<template>
  <div class="pxd-empty-state border rounded-lg py-12 px-18 bg-background w-full">
    <div class="max-w-sm mx-auto flex flex-col space-y-6">
      <template v-if="$slots.icon">
        <div class="pxd-empty-state--icon border rounded-md p-3.5 size-15 flex items-center justify-center mx-auto text-foreground-secondary">
          <slot name="icon" />
        </div>
      </template>

      <div class="pxd-empty-state--content flex flex-col gap-2">
        <p class="pxd-empty-state--title text-foreground text-base text-center font-medium">
          <slot name="title">
            {{ title }}
          </slot>
        </p>

        <p class="pxd-empty-state--description text-foreground-secondary text-sm text-center">
          <slot name="description">
            {{ description }}
          </slot>
        </p>
      </div>

      <slot />
    </div>
  </div>
</template>
