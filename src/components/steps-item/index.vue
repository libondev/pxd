<script lang="ts" setup>
import type { StepsItemProps } from './types'
import CheckIcon from '@gdsicon/vue/check'
import CrossIcon from '@gdsicon/vue/cross'
import { computed, onBeforeUnmount, onMounted, shallowRef, watch } from 'vue'
import { useStepsContext } from '../../contexts/steps.js'
import { getUniqueId } from '../../utils/helper.js'

defineOptions({
  name: 'PStepsItem',
  inheritAttrs: false,
})

const props = defineProps<StepsItemProps>()

const key = getUniqueId('steps-item')
const stepsContext = useStepsContext()
const elRef = shallowRef<HTMLElement>()

const itemIndex = computed(() => {
  const index = stepsContext.items.value.findIndex((item) => item.key === key)

  return index === -1 ? 0 : index
})

const resolvedStatus = computed(() => {
  if (props.status) {
    return props.status
  }

  const current = stepsContext.props.modelValue ?? 0

  if (itemIndex.value < current) {
    return 'finish'
  }

  if (itemIndex.value === current) {
    return stepsContext.props.status ?? 'process'
  }

  return 'wait'
})

const isClickable = computed(() => stepsContext.props.clickable && !props.disabled)

function getItemState() {
  return {
    title: props.title,
    description: props.description,
    status: props.status,
    disabled: props.disabled,
  }
}

function sync(node?: HTMLElement | null) {
  stepsContext.registerItem(key, getItemState(), node)
}

sync()

onMounted(() => {
  sync(elRef.value ?? null)
})

watch(
  () => [props.title, props.description, props.status, props.disabled],
  () => {
    sync(elRef.value)
  },
  { flush: 'post' },
)

onBeforeUnmount(() => {
  stepsContext.unregisterItem(key)
})

function onClick() {
  if (!isClickable.value) {
    return
  }

  stepsContext.select(itemIndex.value)
}
</script>

<template>
  <div
    ref="elRef"
    class="pxd-steps-item px-1 group/steps-item relative flex gap-(--steps-gap) group-data-[direction=horizontal]/steps:flex-1 group-data-[direction=horizontal]/steps:flex-col group-data-[direction=horizontal]/steps:items-center data-[disabled=true]:opacity-50"
    :data-status="resolvedStatus"
    :data-disabled="disabled"
    :class="isClickable ? 'cursor-pointer' : 'cursor-default'"
    role="listitem"
    :aria-current="resolvedStatus === 'process' ? 'step' : undefined"
    v-bind="$attrs"
    @click="onClick"
  >
    <div class="pxd-steps-item--indicator-wrapper relative flex shrink-0">
      <span
        class="pxd-steps-item--indicator font-medium inline-flex size-(--steps-indicator-size) items-center justify-center rounded-full border border-border bg-background-100 text-(length:--steps-indicator-font-size) text-foreground-secondary data-[status=error]:border-red-800 data-[status=error]:bg-red-800 data-[status=error]:text-gray-100 data-[status=finish]:border-gray-300 data-[status=finish]:bg-gray-100 data-[status=process]:border-primary data-[status=process]:bg-primary data-[status=process]:text-primary-foreground motion-safe:transition-colors dark:data-[status=error]:text-gray-1000"
        :data-status="resolvedStatus"
      >
        <CheckIcon
          v-if="resolvedStatus === 'finish'"
          class="pxd-steps-item--icon size-(--steps-icon-size)"
          aria-hidden="true"
        />
        <CrossIcon
          v-else-if="resolvedStatus === 'error'"
          class="pxd-steps-item--icon size-(--steps-icon-size)"
          aria-hidden="true"
        />
        <template v-else>{{ itemIndex + 1 }}</template>
      </span>
    </div>

    <div
      class="pxd-steps-item--content group-data-[direction=horizontal]/steps:min-w-0 flex flex-col group-data-[direction=horizontal]/steps:items-center group-data-[direction=horizontal]/steps:text-center"
    >
      <div
        class="pxd-steps-item--title font-medium text-(length:--steps-title-font-size) leading-(--steps-indicator-size) text-foreground-secondary group-data-[status=error]/steps-item:text-red-700 group-data-[status=process]/steps-item:text-foreground motion-safe:transition-colors"
      >
        <slot name="title">{{ title }}</slot>
      </div>
      <div
        v-if="description || $slots.description"
        class="pxd-steps-item--description text-(length:--steps-description-font-size) text-foreground-secondary opacity-80"
      >
        <slot name="description">{{ description }}</slot>
      </div>
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
