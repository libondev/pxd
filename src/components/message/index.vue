<script lang="ts" setup>
import type { MessageItemConfig, MessageUpdateParams } from '../../composables/use-message'
import type { MessageEmits, MessageProps } from './types'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useDocumentHidden } from '../../composables/use-document-hidden'
import { UPDATE_MESSAGE_EVENT_NAME } from '../../composables/use-message'
import { cachedOff, cachedOn } from '../../utils/event'
import { getCssUnitValue } from '../../utils/format'
import { isServer } from '../../utils/is'
import PMessageItem from '../message-item/index.vue'
import PTeleport from '../teleport/index.vue'
import { useGroupExpand } from './composables/use-group-expand'
import { useMessageTimer } from './composables/use-message-timer'
import { usePromiseMessage } from './composables/use-promise-message'

defineOptions({
  name: 'PMessage',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<MessageProps>(), {
  max: 3,
  group: 'default',
  position: 'top',
})

const emits = defineEmits<MessageEmits>()

const groupMessages = ref<MessageItemConfig[]>([])

const { setAutoCloseTimer, pauseMessage, resumeMessage, clearTimers, pauseAll, resumeAll } =
  useMessageTimer(closeMessageById)

const { handlePromiseMessage } = usePromiseMessage(setAutoCloseTimer)

const { groupExpand, collapse, onPointerEnter, onPointerLeave } = useGroupExpand({
  expand: () => props.expand,
  onPauseAll: () => pauseAll(groupMessages.value),
  onResumeAll: () => resumeAll(groupMessages.value),
})

useDocumentHidden((isHidden) => {
  if (isHidden) {
    pauseAll(groupMessages.value)
  } else {
    resumeAll(groupMessages.value)
  }
})

const messageGroupStyle = computed(() => {
  const frontHeight = groupMessages.value[0]?.height || 0
  const visibleItemCounts = Math.min(props.max, groupMessages.value.length)

  return {
    '--message-width': getCssUnitValue(props.width),
    '--message-items': visibleItemCounts,
    '--message-front-height': getCssUnitValue(frontHeight),
  }
})

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

  if (message._timerId) {
    clearTimeout(message._timerId)
    message._timerId = undefined
  }

  groupMessages.value.splice(index, 1)

  // Avoid manually closing all data and maintaining the expanded state when creating again
  if (!props.expand && groupMessages.value.length === 0) {
    collapse()
  }

  emits('close', id)
}

function clearMessage() {
  clearTimers(groupMessages.value)
  groupMessages.value = []
}

function handleCreateMessage(data: MessageItemConfig) {
  if (!data || data.group !== props.group) {
    return
  }

  groupMessages.value.unshift(data)

  // If it's a loading type with promise, don't start auto-close timer
  // Wait for promise to resolve/reject first
  const isPromiseLoading = data.type === 'loading' && data.promise

  // Make sure the data has been converted to responsive
  // to avoid changing the type from not taking effect.
  const message = groupMessages.value[0]!

  if (isPromiseLoading) {
    handlePromiseMessage(message)
  } else if (message.durations) {
    setAutoCloseTimer(message)
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
  if (isServer()) {
    return
  }

  cachedOn(window, UPDATE_MESSAGE_EVENT_NAME, onUpdateMessage)
})

onBeforeUnmount(() => {
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
  <PTeleport to="body">
    <section
      class="pxd-message h-0 fixed z-20 flex w-(--message-width)"
      aria-live="polite"
      aria-label="Notifications"
      :data-expand="groupExpand"
      :data-position="position"
      :style="messageGroupStyle"
      v-bind="$attrs"
    >
      <TransitionGroup
        appear
        tag="ol"
        name="pxd-transition-message"
        class="pxd-message--group min-w-16 p-0 m-0 flex h-auto w-full max-w-full"
        :class="{ 'gap-3': groupExpand }"
        @pointerenter="onPointerEnter"
        @pointerleave="onPointerLeave"
        @pointercancel="onPointerLeave"
      >
        <PMessageItem
          v-for="(item, index) of groupMessages"
          :key="item.id"
          :max="max"
          :index="index"
          :item-data="item"
          @close="closeMessageById"
        />
      </TransitionGroup>
    </section>
  </PTeleport>
</template>

<style lang="postcss">
.pxd-message {
  --message-width: 356px;

  .pxd-message--group {
    align-items: center;
    flex-direction: column;
  }

  &[data-position^='top'] {
    --item-offset: 10px;
    --starting-offset: -100%;
    top: 1rem;
  }

  &[data-position^='bottom'] {
    --item-offset: -10px;
    --starting-offset: 100%;
    bottom: 1rem;

    .pxd-message--group {
      flex-direction: column-reverse;
    }
  }

  &[data-position='top'],
  &[data-position='bottom'] {
    left: 50%;
    justify-content: center;
    transform: translateX(-50%);
  }

  &[data-position='top-start'],
  &[data-position='bottom-start'] {
    left: 1rem;
    justify-content: flex-start;

    .pxd-message--group {
      align-items: flex-start;
    }
  }

  &[data-position='top-end'],
  &[data-position='bottom-end'] {
    right: 1rem;
    justify-content: flex-end;

    .pxd-message--group {
      align-items: flex-end;
    }
  }

  .pxd-message--item {
    --message-item-scale: var(--message-item-index) * 0.05 + 1;
    --message-item-transition: transform, opacity, height;

    &::after {
      content: '';
      position: absolute;
      right: 0;
      left: 0;
      top: -18px;
      height: 24px;
      z-index: -1;
    }
  }

  &[data-expand='true'] {
    .pxd-message--item {
      --message-item-transform: none;
      position: relative;
      will-change: transform, opacity, height;
    }

    .pxd-transition-message-move {
      transition-property: transform, opacity;
    }
  }

  &[data-expand='false'] {
    .pxd-message--item {
      --message-item-transform: translateZ(0)
        translateY(calc(var(--item-offset) * var(--message-item-index)))
        scale(calc(-1 * var(--message-item-scale)));
      position: absolute;

      &[data-front='false'] {
        height: var(--message-front-height);

        & > * {
          transition: opacity 0.1s ease-out;
          opacity: 0;
        }
      }
    }

    .pxd-transition-message-move {
      transition-duration: 0s;
    }
  }

  &[data-expand] {
    .pxd-transition-message-enter-active,
    .pxd-transition-message-leave-active {
      transition-property: transform, opacity;
    }

    .pxd-transition-message-leave-active {
      position: absolute;
    }

    .pxd-transition-message-enter-from,
    .pxd-transition-message-leave-to {
      opacity: 0;
      --message-item-transform: translateZ(0) translateY(var(--starting-offset)) scaleX(0.97);
    }
  }
}
</style>
