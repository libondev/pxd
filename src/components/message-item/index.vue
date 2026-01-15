<script lang="ts" setup>
import type { MessageItemHeightType, MessageItemType } from '../../composables/use-message'
import type { ComponentClass } from '../../types/shared/props'
import SuccessFillIcon from '@gdsicon/vue/check-circle-fill'
import CloseIcon from '@gdsicon/vue/cross'
import ErrorFillIcon from '@gdsicon/vue/cross-circle-fill'
import InformationFillIcon from '@gdsicon/vue/information-fill'
import LoadingIcon from '@gdsicon/vue/loader-circle'
import WarningFillIcon from '@gdsicon/vue/warning-fill'
import { computed, nextTick, onMounted, shallowRef } from 'vue'
import PButton from '../button/index.vue'

interface Props {
  id: MessageItemType['id']
  max: number
  type?: MessageItemType['type']
  index: number
  expand?: boolean
  classNames?: ComponentClass
  message?: MessageItemType['message']
  closeable?: MessageItemType['closeable']
}

defineOptions({
  name: 'PMessageItem',
  inheritAttrs: false,
})

const props = withDefaults(
  defineProps<Props>(),
  {
    expand: false,
  },
)

const emits = defineEmits<{
  'close': [key: Props['id']]
  'set-item-height': [info: MessageItemHeightType]
}>()

const TYPE_ICONS = {
  info: InformationFillIcon,
  success: SuccessFillIcon,
  warning: WarningFillIcon,
  error: ErrorFillIcon,
  loading: LoadingIcon,
}

const itemRef = shallowRef<HTMLElement>()

const isFront = computed(() => props.index === 0)

const computedStyle = computed(() => {
  const { index, max, expand } = props
  const isVisible = index < max

  return {
    '--message-item-index': index,
    'z-index': max - index,
    'opacity': isVisible ? 1 : 0,
    'position': expand ? 'relative' : 'absolute',
    'pointer-events': isVisible ? 'auto' : 'none',
  } as const
})

function onItemCloseClick() {
  emits('close', props.id)
}

async function setItemHeightInfo() {
  await nextTick()

  if (!itemRef.value) {
    return
  }

  const rect = itemRef.value.getBoundingClientRect()

  const info: MessageItemHeightType = {
    id: props.id,
    height: rect.height,
  }

  emits('set-item-height', info)
}

onMounted(() => {
  setItemHeightInfo()
})
</script>

<template>
  <li
    ref="itemRef"
    tabindex="0"
    :data-index="index"
    :data-front="isFront"
    :style="computedStyle"
    class="pxd-message--item px-3 py-2 text-sm pointer-events-auto box-border flex w-(--message-item-width) max-w-full transform-(--message-item-transform) overflow-hidden rounded-lg bg-background-100 break-all whitespace-pre-wrap shadow-border-modal outline-none motion-safe:transition-(--message-item-transition)"
    :class="[classNames, { 'pr-9': closeable }]"
  >
    <Component :is="TYPE_ICONS[type]" v-if="type" class="pxd-message--icon mr-2 size-4 h-[1lh] shrink-0" :class="type" />

    <span v-if="typeof message === 'string'" v-html="message" />
    <Component :is="message" v-else :key="id" />

    <PButton
      v-if="closeable"
      icon
      size="xs"
      variant="ghost"
      class="top-1.5 right-1.5 absolute z-1 touch-none text-foreground-secondary"
      @click="onItemCloseClick"
    >
      <CloseIcon />
    </PButton>
  </li>
</template>
