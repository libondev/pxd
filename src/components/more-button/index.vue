<script setup lang="ts">
import { ChevronDownIcon } from 'gdsi/vue'
import { computed } from 'vue'
import Button from '../button/index.vue'

interface Props {
  moreText?: string
  lessText?: string
  modelValue?: boolean
}

defineOptions({
  name: 'PxdMoreButton',
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
})

const props = withDefaults(
  defineProps<Props>(),
  {
    moreText: 'Show More',
    lessText: 'Show Less',
    modelValue: false,
  },
)

const emits = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const isExpanded = computed({
  get() {
    return props.modelValue
  },
  set(value: boolean) {
    emits('update:modelValue', value)
  },
})

function onToggleExpand() {
  isExpanded.value = !isExpanded.value
}
</script>

<template>
  <div class="pxd-more-button flex justify-center items-center relative px-4">
    <Button variant="outline" shape="rounded" v-bind="$attrs" class="z-10" @click="onToggleExpand">
      {{ isExpanded ? lessText : moreText }}

      <template #suffix>
        <ChevronDownIcon class="-ml-0.5 motion-safe:transition-transform motion-safe:duration-200" :class="{ 'rotate-180': isExpanded }" />
      </template>
    </Button>
  </div>
</template>

<style>
.pxd-more-button::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  display: block;
  width: 100%;
  border-bottom: 1px solid var(--gray-alpha-300);
}
</style>
