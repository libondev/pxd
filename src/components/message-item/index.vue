<script lang="ts" setup>
import type { MessageItemEmits, MessageItemProps } from './types'
import SuccessFillIcon from '@gdsicon/vue/check-circle-fill'
import CloseIcon from '@gdsicon/vue/cross'
import ErrorFillIcon from '@gdsicon/vue/cross-circle-fill'
import InformationFillIcon from '@gdsicon/vue/information-fill'
import LoadingIcon from '@gdsicon/vue/loader-circle'
import WarningFillIcon from '@gdsicon/vue/warning-fill'
import { computed, onMounted, shallowRef, watch } from 'vue'
import PButton from '../button/index.vue'

defineOptions({
  name: 'PMessageItem',
  inheritAttrs: false,
})

const props = defineProps<MessageItemProps>()
const emits = defineEmits<MessageItemEmits>()

const TYPE_ICONS = {
  info: InformationFillIcon,
  success: SuccessFillIcon,
  warning: WarningFillIcon,
  error: ErrorFillIcon,
  loading: LoadingIcon,
}

const itemRef = shallowRef<HTMLElement>()

const computedStyle = computed(() => {
  const { index, max } = props
  const isVisible = index < max

  return {
    '--message-item-index': index,
    'z-index': max - index,
    opacity: isVisible ? 1 : 0,
    'pointer-events': isVisible ? 'auto' : 'none',
  } as const
})

function onItemCloseClick() {
  if (props.itemData.action?.onClick) {
    props.itemData.action.onClick()
  }

  emits('close', props.itemData.id)
}

function setItemHeightInfo() {
  if (!itemRef.value) {
    return
  }

  // It is necessary to ensure the reference to the original object;
  // otherwise, the type of the promise data cannot be updated.
  props.itemData.height = itemRef.value.offsetHeight
}

watch(
  () => props.itemData.message,
  () => {
    if (!itemRef.value) {
      return
    }

    setItemHeightInfo()
  },
)

onMounted(() => {
  setItemHeightInfo()
})
</script>

<template>
  <li
    ref="itemRef"
    tabindex="0"
    :data-index="index"
    :data-front="index === 0"
    :style="computedStyle"
    class="pxd-message--item px-3 py-2 text-sm flex w-full max-w-full shrink-0 transform-(--message-item-transform) rounded-lg bg-background-100 break-all whitespace-pre-wrap shadow-border-modal outline-none motion-safe:transition-(--message-item-transition)"
    :class="[itemData.class, { 'pr-9': itemData.closeable }]"
    v-bind="$attrs"
  >
    <Component
      :is="TYPE_ICONS[itemData.type]"
      v-if="itemData.type"
      class="pxd-message--icon mr-2 size-4 h-lh shrink-0"
      :class="itemData.type"
    />

    <span v-if="typeof itemData.message === 'string'" v-html="itemData.message" />
    <Component :is="itemData.message" v-else :key="itemData.id" />

    <PButton
      v-if="itemData.closeable || itemData.action"
      size="xs"
      :icon="!itemData.action?.variant"
      :variant="itemData.action?.variant ?? 'ghost'"
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
