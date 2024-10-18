<script lang="ts" setup>
defineOptions({
  name: 'PInput',
})

const props = defineProps < {
  error?: string
  disabled?: boolean
}>()

const inputRef = useTemplateRef('inputRef')

const randomId = useId()

const borderColors = computed(() => {
  if (props.error) {
    return `shadow-[0_0_0_1px_hsl(var(--p-red-900-value)),0_0_0_3px_hsl(var(--p-red-300-value))] [&:not([data-disabled=true])]:hover:shadow-[0_0_0_1px_hsl(var(--p-red-900-value)),0_0_0_3px_hsl(var(--p-red-500-value))]`
  }

  return `shadow-[0_0_0_1px_var(--p-gray-alpha-400)] [&:not([data-disabled=true])]:hover:shadow-[0_0_0_1px_var(--p-gray-alpha-500)]`
})
</script>

<template>
  <div
    class="
      pxd-input group inline-flex items-center justify-center h-8 rounded-md overflow-hidden transition-shadow focus-within:!shadow-[0_0_0_1px_var(--p-gray-alpha-600),0_0_0_3px_rgba(0,0,0,.16)]
    "
    :class="borderColors"
    :data-disabled="disabled"
  >
    <label v-if="$slots.prefix" :for="randomId" class="px-3 text-sm text-gray-700">
      <slot name="prefix">
        0

      </slot>
    </label>

    <input
      :id="randomId"
      ref="inputRef"
      class="
        rounded-inherit h-full px-3 w-full font-inherit bg-background-100 text-sm placeholder:text-gray-500
        disabled:cursor-not-allowed disabled:bg-gray-100 disabled:placeholder:opacity-0 outline-none
        file:border-0 file:bg-transparent file:text-sm file:font-medium
      "
      :disabled="disabled"
      v-bind="$attrs"
    >

    <label v-if="$slots.suffix" :for="randomId" class="px-3 text-sm text-gray-700">
      <slot name="suffix">
        1
      </slot>
    </label>
  </div>
</template>
