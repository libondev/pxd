<script lang="ts" setup>
import type { VNode } from 'vue'
import SuccessFillIcon from '@gdsicon/vue/check-circle-fill'
import CloseIcon from '@gdsicon/vue/cross'
import ErrorFillIcon from '@gdsicon/vue/cross-circle-fill'
import InformationFillIcon from '@gdsicon/vue/information-fill'
import LoadingIcon from '@gdsicon/vue/loader-circle'
import WarningFillIcon from '@gdsicon/vue/warning-fill'
import { computed, onMounted, shallowRef } from 'vue'
import { doubleRaf } from '../../utils/event'
import PButton from '../button/index.vue'

interface Props {
  id?: string
  max: number
  type?: keyof typeof TYPE_ICONS | false | ''
  index: number
  expand?: boolean
  message?: string | VNode
  closeable?: boolean
}

defineOptions({
  name: 'PMessageItem',
})

const props = withDefaults(
  defineProps<Props>(),
  {
    expand: false,
  },
)

const emits = defineEmits<{
  close: [key: Props['id']]
}>()

const TYPE_ICONS = {
  info: InformationFillIcon,
  success: SuccessFillIcon,
  warning: WarningFillIcon,
  error: ErrorFillIcon,
  loading: LoadingIcon,
}

const itemRef = shallowRef<HTMLElement>()
const isMounted = shallowRef(false)

const isFront = computed(() => props.index === 0)

const computedStyle = computed(() => {
  const { index, max, expand } = props

  return {
    '--index': index,
    'z-index': max - index,
    'opacity': index < max ? 1 : 0,
    'position': expand ? 'relative' : 'absolute',
  } as const
})

function onItemCloseClick() {
  emits('close', props.id)
}

onMounted(() => {
  // ensure the element is mounted after the browser has rendered the initial state
  doubleRaf(() => {
    isMounted.value = true
  })
})
</script>

<template>
  <li
    ref="itemRef"
    tabindex="0"
    :data-index="index"
    :data-front="isFront"
    :data-mount="isMounted"
    :style="computedStyle"
    class="pxd-message--item py-2 px-3 text-sm flex w-(--message-item-width) max-w-full transform-(--transform) rounded-lg bg-background-100 break-all whitespace-pre-wrap shadow-border-modal outline-none motion-safe:transition-(--transition)"
    :class="{ 'pr-9 pointer-events-auto': closeable }"
  >
    <Component :is="TYPE_ICONS[type]" v-if="type" class="pxd-message--icon size-4 mr-2 h-[1lh] shrink-0" :class="type" />

    <span v-if="typeof message === 'string'" v-html="message" />
    <Component :is="message" v-else :key="id" />

    <PButton
      v-if="closeable"
      icon
      size="xs"
      variant="ghost"
      class="right-1.5 top-1.5 absolute z-1 touch-none text-foreground-secondary"
      @click="onItemCloseClick"
    >
      <CloseIcon />
    </PButton>
  </li>
</template>
