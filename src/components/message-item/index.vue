<script lang="ts" setup>
import type { MessageItemEmits, MessageItemProps } from './types'
import SuccessFillIcon from '@gdsicon/vue/check-circle-fill'
import CloseIcon from '@gdsicon/vue/cross'
import ErrorFillIcon from '@gdsicon/vue/cross-circle-fill'
import InformationFillIcon from '@gdsicon/vue/information-fill'
import LoadingIcon from '@gdsicon/vue/loader-circle'
import WarningFillIcon from '@gdsicon/vue/warning-fill'
import { computed, onMounted, shallowRef, watch } from 'vue'
import { useResizeObserver } from '../../composables/use-resize-observer.js'
import { useConfigProvider } from '../../contexts/config-provider.js'
import PButton from '../button/index.vue'

defineOptions({
  name: 'PMessageItem',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<MessageItemProps>(), {
  offset: 0,
})
const emits = defineEmits<MessageItemEmits>()

const VARIANT_ICONS = {
  info: InformationFillIcon,
  success: SuccessFillIcon,
  warning: WarningFillIcon,
  error: ErrorFillIcon,
  loading: LoadingIcon,
}

const itemRef = shallowRef<HTMLElement>()
const contentRef = shallowRef<HTMLElement>()

const computedStyle = computed(() => {
  const { index, maxCount } = props

  return {
    '--message-item-index': index,
    '--message-item-offset': `${props.offset}px`,
    '--message-item-height': `${props.itemData.height ?? 0}px`,
    'z-index': maxCount - index,
  } as const
})

const configProvider = useConfigProvider()

// The card sets its rendered height from the stored one, so growing content cannot resize it;
// observe the content instead or an async message would keep the height it had at mount.
useResizeObserver(contentRef, setItemHeightInfo)

function onItemCloseClick() {
  if (props.itemData.action?.onClick) {
    props.itemData.action.onClick()
  }

  emits('close', props.itemData.id)
}

function setItemHeightInfo() {
  const el = itemRef.value

  if (!el) {
    return
  }

  // It is necessary to ensure the reference to the original object;
  // otherwise, the type of the promise data cannot be updated.
  const height = el.style.height

  // The stack sets the rendered height per state; measure the natural one instead.
  el.style.height = 'auto'
  const measured = el.offsetHeight
  el.style.height = height

  if (props.itemData.height !== measured) {
    props.itemData.height = measured
  }
}

watch(() => props.itemData.message, setItemHeightInfo, { flush: 'post' })

onMounted(() => {
  setItemHeightInfo()
})
</script>

<template>
  <li
    ref="itemRef"
    :tabindex="index < maxCount ? 0 : undefined"
    :inert="index >= maxCount"
    data-message-item
    :data-index="index"
    :data-front="index === 0"
    :data-visible="index < maxCount"
    :style="computedStyle"
    class="pxd-message-item px-3 py-2 text-sm flex w-full max-w-full shrink-0 transform-(--message-item-transform) rounded-lg bg-background-100 break-all whitespace-pre-wrap shadow-border-modal outline-none data-[visible=false]:opacity-0 motion-safe:transition-(--message-item-transition)"
    :class="[itemData.class, { 'pe-9': itemData.closeable }]"
    v-bind="$attrs"
  >
    <div ref="contentRef" class="min-w-0 flex flex-1 self-start">
      <Component
        :is="VARIANT_ICONS[itemData.variant]"
        v-if="itemData.variant"
        class="pxd-message--icon me-2 size-em h-lh shrink-0"
        :class="itemData.variant"
      />

      <span v-if="typeof itemData.message === 'string'" v-html="itemData.message" />
      <Component :is="itemData.message" v-else :key="itemData.id" />
    </div>

    <PButton
      v-if="itemData.closeable || itemData.action"
      size="xs"
      :icon-only="!itemData.action?.variant"
      :variant="itemData.action?.variant ?? 'ghost'"
      :aria-label="itemData.action?.label ? undefined : configProvider.locale.interaction.close"
      class="top-1.5 right-1.5 px-0! text-xs absolute z-1 touch-none text-foreground-secondary"
      @click="onItemCloseClick"
    >
      <template v-if="itemData.action?.label">
        {{ itemData.action.label }}
      </template>
      <CloseIcon v-else />
    </PButton>
  </li>
</template>

<style lang="postcss">
.pxd-message--icon {
  &.info {
    color: var(--color-gray-600);
  }

  &.error {
    color: var(--color-red-700);
  }

  &.loading {
    animation: spin 1s linear infinite;
    color: var(--color-blue-700);
  }

  &.warning {
    color: var(--color-amber-700);
  }

  &.success {
    color: var(--color-green-700);
  }
}
</style>
