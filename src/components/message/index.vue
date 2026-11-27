<script lang="ts" setup>
import type { MessageItemConfig, MessageUpdateParams } from '../../composables/use-message'
import type { MessageEmits, MessageProps } from './types'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useMessageGroup } from '../../composables/_internal/use-message-group.js'
import { useTopLayerTarget } from '../../composables/_internal/use-top-layer.js'
import { useDocumentHidden } from '../../composables/use-document-hidden.js'
import { UPDATE_MESSAGE_EVENT_NAME } from '../../composables/use-message.js'
import { useConfigProvider } from '../../contexts/config-provider.js'
import { cachedOff, cachedOn } from '../../utils/event.js'
import { getCssUnitValue } from '../../utils/format.js'
import PClientTeleport from '../_internal/client-teleport.vue'
import PMessageItem from '../message-item/index.vue'

defineOptions({
  name: 'PMessage',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<MessageProps>(), {
  maxCount: 3,
  group: 'default',
  position: 'top',
})

const emits = defineEmits<MessageEmits>()

const MESSAGE_GAP = 8

const groupMessages = ref<MessageItemConfig[]>([])
const messageGroupStyle = computed(() => {
  const frontHeight = groupMessages.value[0]?.height || 0

  return {
    '--message-width': getCssUnitValue(props.width),
    '--message-front-height': getCssUnitValue(frontHeight),
    '--message-deck-offset': `${MESSAGE_GAP}px`,
  }
})
const itemOffsets = computed(() => {
  let height = 0

  return groupMessages.value.map((message, index) => {
    const offset = height + index * MESSAGE_GAP
    height += message.height ?? 0

    return offset
  })
})

const topLayerTarget = useTopLayerTarget()
const configProvider = useConfigProvider()

const {
  groupExpand,
  collapse,
  onPointerEnter,
  onPointerLeave,
  startTimer,
  clearTimer,
  clearTimers,
  pauseMessage,
  resumeMessage,
  pauseAll,
  resumeAll,
  handlePromiseMessage,
  dispose: disposeMessageGroup,
} = useMessageGroup({
  messages: groupMessages,
  expand: () => props.expand,
  onTimeout: closeMessageById,
})

useDocumentHidden((isHidden) => {
  if (isHidden) {
    pauseAll()
  } else {
    resumeAll()
  }
})

function onBeforeLeave(el: Element) {
  const item = el as HTMLElement

  // The stack shares one front height, so pin the card before that value moves on.
  item.style.height = getComputedStyle(item).height
}

function getMessageById(id: MessageItemConfig['id']) {
  const index = groupMessages.value.findIndex((m) => m.id === id)
  const message = groupMessages.value[index]

  if (!message) {
    return {
      index: -1,
      message: null,
    }
  }

  return {
    index,
    message,
  }
}

function pauseMessageById(id: MessageItemConfig['id']) {
  if (!id) {
    return
  }

  const { message } = getMessageById(id)
  if (message) {
    pauseMessage(message)
  }
}

function resumeMessageById(id: MessageItemConfig['id']) {
  if (!id) {
    return
  }

  const { message } = getMessageById(id)
  if (message) {
    resumeMessage(message)
  }
}

function closeMessageById(id: MessageItemConfig['id']) {
  const { index, message } = getMessageById(id)

  if (!message) {
    return
  }

  clearTimer(message)

  groupMessages.value.splice(index, 1)

  // Avoid manually closing all data and maintaining the expanded state when creating again
  if (!props.expand && groupMessages.value.length === 0) {
    collapse()
  }

  emits('close', id)
}

function clearMessage() {
  clearTimers()
  groupMessages.value = []

  if (!props.expand) {
    collapse()
  }
}

function handleCreateMessage(data: MessageItemConfig) {
  if (!data || data.group !== props.group) {
    return
  }

  groupMessages.value.unshift(data)

  // If it's a loading type with promise, don't start auto-close timer
  // Wait for promise to resolve/reject first
  const isPromiseLoading = data.variant === 'loading' && data.promise

  // Make sure the data has been converted to responsive
  // to avoid changing the type from not taking effect.
  const message = groupMessages.value[0]!

  if (isPromiseLoading) {
    handlePromiseMessage(message)
  } else if (message.duration) {
    startTimer(message)
  }
}

function onUpdateMessage({ detail }: CustomEvent<MessageUpdateParams>) {
  if (detail.group !== props.group) {
    return
  }

  switch (detail.type) {
    case 'create':
      if (detail.data) {
        handleCreateMessage(detail.data as MessageItemConfig)
      }
      break
    case 'remove':
      if (detail.data) {
        const { id } = detail.data as { id: MessageItemConfig['id'] }
        if (id) {
          closeMessageById(id)
        }
      }
      break
    case 'clear':
      clearMessage()
      break
  }
}

onMounted(() => {
  cachedOn(window, UPDATE_MESSAGE_EVENT_NAME, onUpdateMessage)
})

onBeforeUnmount(() => {
  disposeMessageGroup()
  clearMessage()

  cachedOff(window, UPDATE_MESSAGE_EVENT_NAME, onUpdateMessage)
})

defineExpose({
  messages: groupMessages,
  get: getMessageById,
  pause: pauseMessageById,
  resume: resumeMessageById,
  close: closeMessageById,
  clear: clearMessage,
})
</script>

<template>
  <PClientTeleport :to="topLayerTarget">
    <section
      data-message
      class="pxd-message h-0 fixed z-50 w-(--message-width)"
      aria-live="polite"
      :aria-label="configProvider.locale.message.notifications"
      :data-expand="Boolean(groupExpand)"
      :data-position="position"
      :style="messageGroupStyle"
      v-bind="$attrs"
    >
      <TransitionGroup
        appear
        tag="ol"
        name="pxd-transition-message"
        class="pxd-message--group p-0 m-0"
        @before-leave="onBeforeLeave"
        @pointerenter="onPointerEnter"
        @pointerleave="onPointerLeave"
        @pointercancel="onPointerLeave"
      >
        <PMessageItem
          v-for="(item, index) of groupMessages"
          :key="item.id"
          :max-count="maxCount"
          :index="index"
          :offset="itemOffsets[index] ?? 0"
          :item-data="item"
          @close="closeMessageById"
        />
      </TransitionGroup>
    </section>
  </PClientTeleport>
</template>

<style lang="postcss">
.pxd-message {
  --message-width: 22.25rem;
  --message-deck-offset: 0.5rem;

  &[data-position^='top'] {
    --message-lift: 1;
    --message-enter-offset: -100%;
    top: 1rem;
  }

  &[data-position^='bottom'] {
    --message-lift: -1;
    --message-enter-offset: 100%;
    bottom: 1rem;
  }

  &[data-position='top'],
  &[data-position='bottom'] {
    left: 50%;
    transform: translateX(-50%);
  }

  &[data-position='top-start'],
  &[data-position='bottom-start'] {
    left: 1rem;
  }

  &[data-position='top-end'],
  &[data-position='bottom-end'] {
    right: 1rem;
  }

  &[data-position^='top'] .pxd-message-item {
    top: 0;
  }

  &[data-position^='bottom'] .pxd-message-item {
    bottom: 0;
  }

  .pxd-message-item {
    --message-item-scale: calc(1 - var(--message-item-index) * 0.05);
    --message-item-transition: transform, opacity, height;

    position: absolute;
    inset-inline: 0;

    & > * {
      transition: opacity calc(var(--default-transition-duration) * 0.9)
        var(--default-transition-timing-function);
    }

    &::after {
      content: '';
      position: absolute;
      right: 0;
      left: 0;
      top: -1.125rem;
      height: 1.5rem;
      z-index: -1;
    }
  }

  &[data-expand='true'] {
    .pxd-message-item {
      --message-item-transform: translateY(calc(var(--message-lift) * var(--message-item-offset)));
      height: var(--message-item-height);
    }
  }

  &[data-expand='false'] {
    .pxd-message-item {
      --message-item-transform: translateY(
          calc(var(--message-lift) * var(--message-deck-offset) * var(--message-item-index))
        )
        scale(var(--message-item-scale));
      height: var(--message-front-height);

      &[data-front='false'] > * {
        opacity: 0;
      }
    }
  }

  &[data-expand] {
    .pxd-transition-message-enter-active,
    .pxd-transition-message-leave-active {
      transition-property: transform, opacity, height;
    }

    .pxd-transition-message-enter-from,
    .pxd-transition-message-leave-to {
      opacity: 0;
      --message-item-transform: translateY(var(--message-enter-offset));
    }
  }
}
</style>
