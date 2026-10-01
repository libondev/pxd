<script lang="ts" setup>
import type { StepsOption, StepsStatus } from './types'
import CheckIcon from '@gdsicon/vue/check'
import CrossIcon from '@gdsicon/vue/cross'
import { computed } from 'vue'

defineOptions({
  name: 'PStepsItem',
})

const props = defineProps<{
  clickable?: boolean
  index: number
  option: StepsOption
  status: StepsStatus
}>()

const emits = defineEmits<{ select: [number] }>()

const disabled = computed(() => !!props.option.disabled)

function onClick() {
  if (!props.clickable || disabled.value) {
    return
  }

  emits('select', props.index)
}
</script>

<template>
  <div
    class="pxd-steps-item px-1 group/steps-item relative flex gap-(--steps-gap) group-data-[direction=horizontal]/steps:flex-1 group-data-[direction=horizontal]/steps:flex-col group-data-[direction=horizontal]/steps:items-center data-[disabled=true]:opacity-50"
    :data-status="status"
    :data-disabled="disabled"
    :class="clickable && !disabled ? 'cursor-pointer' : 'cursor-default'"
    role="listitem"
    :aria-current="status === 'process' ? 'step' : undefined"
    @click="onClick"
  >
    <div class="pxd-steps-item--indicator-wrapper relative flex shrink-0">
      <span
        class="pxd-steps-item--indicator font-medium inline-flex size-(--steps-indicator-size) items-center justify-center rounded-full border border-border bg-background-100 text-(length:--steps-indicator-font-size) text-foreground-secondary data-[status=error]:border-red-800 data-[status=error]:bg-red-800 data-[status=error]:text-gray-100 data-[status=finish]:border-gray-300 data-[status=finish]:bg-gray-100 data-[status=process]:border-primary data-[status=process]:bg-primary data-[status=process]:text-primary-foreground motion-safe:transition-colors dark:data-[status=error]:text-gray-1000"
        :data-status="status"
      >
        <CheckIcon
          v-if="status === 'finish'"
          class="pxd-steps-item--icon size-(--steps-icon-size)"
          aria-hidden="true"
        />
        <CrossIcon
          v-else-if="status === 'error'"
          class="pxd-steps-item--icon size-(--steps-icon-size)"
          aria-hidden="true"
        />
        <template v-else>{{ index + 1 }}</template>
      </span>
    </div>

    <div
      class="pxd-steps-item--content group-data-[direction=horizontal]/steps:min-w-0 flex flex-col group-data-[direction=horizontal]/steps:items-center group-data-[direction=horizontal]/steps:text-center"
    >
      <slot>
        <div
          class="pxd-steps-item--title font-medium text-(length:--steps-title-font-size) leading-(--steps-indicator-size) text-foreground-secondary group-data-[status=error]/steps-item:text-red-700 group-data-[status=process]/steps-item:text-foreground motion-safe:transition-colors"
        >
          {{ option.title }}
        </div>
        <div
          v-if="option.description"
          class="pxd-steps-item--description text-(length:--steps-description-font-size) text-foreground-secondary opacity-80"
        >
          {{ option.description }}
        </div>
      </slot>
    </div>
  </div>
</template>

<style lang="postcss">
.pxd-steps-item {
  .pxd-steps[data-direction='horizontal'] & {
    &:not(:last-child)::after {
      content: '';
      position: absolute;
      top: calc(var(--steps-indicator-size) / 2);
      left: calc(50% + var(--steps-indicator-size) / 2 + var(--steps-gap));
      right: calc(-50% + var(--steps-indicator-size) / 2 + var(--steps-gap));
      height: 1px;
      background-color: var(--color-border);
    }

    &[data-status='finish']::after {
      background-color: var(--color-primary);
    }
  }

  .pxd-steps[data-direction='vertical'] & {
    &:not(:last-child) {
      padding-bottom: var(--steps-gap);
    }

    &:not(:last-child)::after {
      content: '';
      position: absolute;
      top: calc(var(--steps-indicator-size) + var(--steps-gap) / 2);
      bottom: calc(var(--steps-gap) / 2);
      left: calc(var(--steps-indicator-size) / 2 + var(--spacing));
      width: 1px;
      background-color: var(--color-border);
    }

    &[data-status='finish']::after {
      background-color: var(--color-primary);
    }
  }
}
</style>
