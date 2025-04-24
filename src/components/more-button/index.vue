<script setup lang="ts">
import { ChevronDownIcon } from 'gdsi/vue'
import { computed } from 'vue'
import Button from '../button/index.vue'

interface Props {
  moreText?: string
  lessText?: string
  modelValue?: boolean
  buttonProps?: InstanceType<typeof Button>['$props']
}

defineOptions({
  name: 'PMoreButton',
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
    buttonProps: () => ({}),
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

function getButtonProps(): Props['buttonProps'] {
  return {
    shape: 'rounded',
    ...props.buttonProps,
  }
}

function onToggleExpand() {
  isExpanded.value = !isExpanded.value
}
</script>

<template>
  <div class="pxd-more-button w-full flex items-center px-4 mt-4">
    <Button class="relative z-10" v-bind="getButtonProps()" @click="onToggleExpand">
      {{ isExpanded ? lessText : moreText }}

      <template #suffix>
        <ChevronDownIcon class="-ml-0.5 motion-safe:transition-transform motion-safe:duration-200" :class="{ 'rotate-180': isExpanded }" />
      </template>
    </Button>
  </div>
</template>

<style>
.pxd-more-button::before,
.pxd-more-button::after {
  content: '';
  display: block;
  width: 100%;
  border-top: 1px solid var(--gray-alpha-300);
}
</style>
