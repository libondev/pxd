<script lang="ts" setup>
import { CheckboxIndicator, CheckboxRoot } from 'radix-vue'

defineOptions({
  name: 'PxCheckbox',
  install(this: Component, app: App) {
    app.component(this.name, this)
  }
})

const checkState = defineModel<boolean>()
</script>

<template>
  <label class="pxd-checkbox outline-none">
    <CheckboxRoot v-model:checked="checkState"
      class="w-4 h-4 p-0 b-(1 solid input) shadow-sm rounded outlines bg-background overflow-hidden data-[state=unchecked]:va--1.4px data-[state=checked]:(b-primary va--1px)"
      v-bind="$attrs"
    >
      <CheckboxIndicator class="block flex items-center justify-center h-full w-full bg-primary">
        <i class="i-ic-check bg-background" />
      </CheckboxIndicator>
    </CheckboxRoot>

    <span class="pl-1.5 active:select-none">
      <slot />
    </span>
  </label>
</template>
