<script lang="ts" setup>
import type { MessageItemHeightType, MessageItemType } from '../../composables/use-message'
import type { ComponentPosition } from '../../types/shared/props'

import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  CLEAR_MESSAGES_EVENT_NAME,
  CREATE_MESSAGE_EVENT_NAME,
  REMOVE_MESSAGE_EVENT_NAME,
} from '../../composables/use-message'
import { cachedOff, cachedOn } from '../../utils/event'
import { getCssUnitValue } from '../../utils/format'
import { isServer } from '../../utils/is'
import PMessageItem from '../message-item/index.vue'
import PTeleport from '../teleport/index.vue'

interface Props {
  max?: number
  width?: string | number
  group?: string
  expand?: boolean
  position?: ComponentPosition<'top' | 'bottom'>
}

defineOptions({
  name: 'PMessage',
})

const props = withDefaults(
  defineProps<Props>(),
  {
    max: 3,
    group: 'default',
    position: 'top',
  },
)

const groupExpand = ref(props.expand)
const groupMessages = ref<MessageItemType[]>([])
const messageItemsHeight = ref<MessageItemHeightType[]>([])

const messageGroupStyle = computed(() => {
  return {
    '--message-width': getCssUnitValue(props.width),
    '--message-items': Math.min(props.max, groupMessages.value.length),
    '--message-front-height': getCssUnitValue(messageItemsHeight.value[0]?.height),
  }
})

function getMessageById(id: MessageItemType['id']) {
  const index = groupMessages.value.findIndex(m => m.id === id)
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

function setAutoCloseTimer(message: MessageItemType) {
  message._startedAtMs = Date.now()

  if (message._remainingMs == null) {
    message._remainingMs = message.durations
  }

  if (message._timerId) {
    clearTimeout(message._timerId)
  }

  message._timerId = setTimeout(() => {
    closeMessageById(message.id)
  }, message._remainingMs)
}

function pauseMessageById(id: MessageItemType['id']) {
  if (!id) {
    return
  }

  const { message } = getMessageById(id)

  if (!message) {
    return
  }

  if (!message.durations || message.durations <= 0) {
    return
  }

  if (message._timerId) {
    clearTimeout(message._timerId)
    message._timerId = undefined
  }

  if (message._startedAtMs != null) {
    const elapsed = Date.now() - message._startedAtMs
    const previousRemaining = message._remainingMs ?? message.durations
    message._remainingMs = Math.max(0, previousRemaining - elapsed)
  }
}

function resumeMessageById(id: MessageItemType['id']) {
  if (!id) {
    return
  }

  const { message } = getMessageById(id)

  if (!message) {
    return
  }

  if (!message.durations || message.durations <= 0) {
    return
  }

  const remaining = message._remainingMs ?? 0
  // if remaining time is very short,
  // close directly to reduce one short timer scheduling
  if (remaining <= 0 || remaining <= 100) {
    closeMessageById(id)
    return
  }

  setAutoCloseTimer(message)
}

function closeMessageById(id: MessageItemType['id']) {
  const { index, message } = getMessageById(id)

  if (!message) {
    return
  }

  if (message && message._timerId) {
    clearTimeout(message._timerId)
    message._timerId = undefined
  }

  groupMessages.value.splice(index, 1)
  messageItemsHeight.value.splice(index, 1)

  // Avoid manually closing all data and maintaining the expanded state when creating again
  if (!props.expand && groupMessages.value.length === 0) {
    groupExpand.value = false
  }
}

function onUpdateMessageItemInfo(info: MessageItemHeightType) {
  messageItemsHeight.value.unshift(info)
}

function clearMessage() {
  groupMessages.value.forEach((m) => {
    if (!m._timerId) {
      return
    }

    clearTimeout(m._timerId)
    m._timerId = undefined
  })

  groupMessages.value = []
}

function resolvePromiseMessage<T>(
  handler: MessageItemType['success'],
  data: T,
): string | undefined {
  if (!handler) {
    return undefined
  }

  if (typeof handler === 'function') {
    const result = handler(data)
    // VNode is not a string, so we need to check if it's a string
    return typeof result === 'string' ? result : undefined
  }

  return typeof handler === 'string' ? handler : undefined
}

function handlePromiseMessage(message: MessageItemType) {
  if (!message.promise) {
    return
  }

  let promiseResult: unknown

  message.promise
    .then((data) => {
      promiseResult = data
      message.type = 'success'

      const successMessage = resolvePromiseMessage(message.success, data)
      if (successMessage) {
        message.message = successMessage
      }
    })
    .catch((err) => {
      promiseResult = err
      message.type = 'error'

      const errorMessage = resolvePromiseMessage(message.error, err)
      if (errorMessage) {
        message.message = errorMessage
      }
    })
    .finally(() => {
      const finallyMessage = resolvePromiseMessage(message.finally, promiseResult)
      if (finallyMessage) {
        message.message = finallyMessage
      }

      // Cleanup promise-related properties
      message.promise = undefined
      message.success = undefined
      message.error = undefined
      message.finally = undefined

      if (message.durations && message.durations > 0) {
        message._remainingMs = message.durations
        setAutoCloseTimer(message)
      }
    })
}

function onCreateMessage({ detail: data }: CustomEvent<MessageItemType>) {
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

function onRemoveMessage({ detail: data }: CustomEvent<MessageItemType>) {
  if (!data || !data.id || data.group !== props.group) {
    return
  }

  closeMessageById(data.id)
}

function onClearMessages({ detail: data }: CustomEvent<MessageItemType>) {
  if (!data || data.group !== props.group) {
    return
  }

  clearMessage()
}

function pauseAllMessages() {
  groupMessages.value.forEach((message) => {
    pauseMessageById(message.id)
  })
}

function resumeAllMessages() {
  groupMessages.value.forEach((message) => {
    resumeMessageById(message.id)
  })
}

function onPointerEnter() {
  groupExpand.value = true
  pauseAllMessages()
}

function onPointerLeave() {
  resumeAllMessages()

  // If expand is set in props,
  // the user's default configuration cannot be modified when moving out.
  if (props.expand) {
    return
  }

  groupExpand.value = false
}

watch(
  () => props.expand,
  (isExpand) => {
    groupExpand.value = isExpand
  },
  { immediate: true },
)

onMounted(() => {
  if (isServer()) {
    return
  }

  cachedOn(window, CLEAR_MESSAGES_EVENT_NAME, onClearMessages)
  cachedOn(window, CREATE_MESSAGE_EVENT_NAME, onCreateMessage)
  cachedOn(window, REMOVE_MESSAGE_EVENT_NAME, onRemoveMessage)
})

onBeforeUnmount(() => {
  clearMessage()

  cachedOff(window, CLEAR_MESSAGES_EVENT_NAME, onCreateMessage)
  cachedOff(window, CREATE_MESSAGE_EVENT_NAME, onCreateMessage)
  cachedOff(window, REMOVE_MESSAGE_EVENT_NAME, onRemoveMessage)
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
    >
      <TransitionGroup
        appear
        tag="ol"
        name="pxd-transition-message"
        class="pxd-message--group min-w-16 flex h-auto w-full"
        :class="{ 'gap-3': groupExpand }"
        @pointerenter="onPointerEnter"
        @pointerleave="onPointerLeave"
      >
        <PMessageItem
          v-for="(item, index) of groupMessages"
          :id="item.id"
          :key="item.id"
          :max="max"
          :type="item.type"
          :index="index"
          :expand="groupExpand"
          :message="item.message"
          :class-names="item.class"
          :closeable="item.closeable"
          @close="closeMessageById"
          @set-item-height="onUpdateMessageItemInfo"
        />
      </TransitionGroup>
    </section>
  </PTeleport>
</template>

<style lang="postcss">
.pxd-message {
  --message-width: 356px;

  .pxd-message--group {
    max-width: 100vw;
    align-items: center;
    flex-direction: column;

    &:not(:empty)::after {
      content: '';
      position: absolute;
      left: 0;
      width: 100%;
      z-index: 0;
      height: calc(var(--message-front-height) + (10px * var(--message-items)));
    }
  }

  &[data-position^="top"] {
    --item-offset: 10px;
    --starting-offset: -100%;
    top: 1rem;

    .pxd-message--item {
      transform-origin: top center;
    }
  }

  &[data-position^="bottom"] {
    --item-offset: -10px;
    --starting-offset: 100%;
    bottom: 1rem;

    .pxd-message--group {
      flex-direction: column-reverse;
    }

    .pxd-message--item {
      transform-origin: bottom center;
    }
  }

  &[data-position="top"],
  &[data-position="bottom"] {
    left: 50%;
    justify-content: center;
    transform: translateX(-50%);
  }

  &[data-position="top-start"],
  &[data-position="bottom-start"] {
    left: 0;
    justify-content: flex-start;

    .pxd-message--group {
      align-items: flex-start;
    }
  }

  &[data-position="top-end"],
  &[data-position="bottom-end"] {
    right: 0;
    justify-content: flex-end;

    .pxd-message--group {
      align-items: flex-end;
    }
  }

  .pxd-message--item {
    --message-item-scale: var(--message-item-index) * 0.05 + 1;
    --message-item-transition: transform, opacity, height, box-shadow;
  }

  &[data-expand="true"] {
    .pxd-message--item {
      --message-item-transform: none;
      position: relative;

      &::after{
        content: '';
        position: absolute;
        top: 100%;
        left: 0;
        width: 100%;
        height: 12px;
      }
    }
  }

  &[data-expand="false"] {
    .pxd-message--item {
      --message-item-transform: translateY(calc(var(--item-offset) * var(--message-item-index))) scale(calc(-1 * var(--message-item-scale)));
      position: absolute;

      &[data-front="false"] {
        height: var(--message-front-height);

        & > * {
          transition: opacity var(--default-transition-duration) var(--default-transition-timing-function);
          opacity: 0;
        }
      }
    }
  }

  &[data-expand] {
    .pxd-transition-message-move,
    .pxd-transition-message-enter-active,
    .pxd-transition-message-leave-active {
      transition:
        transform var(--default-transition-duration) var(--default-transition-timing-function),
        opacity var(--default-transition-duration) var(--default-transition-timing-function);
    }

    .pxd-transition-message-leave-active {
      position: absolute;
    }

    .pxd-transition-message-enter-from,
    .pxd-transition-message-leave-to {
      opacity: 0;
      --message-item-transform: translateY(var(--starting-offset)) scale(0.95);
    }
  }

  .pxd-message--icon {
    &.info {
      color: var(--color-gray-600)
    }
    &.error {
      color: var(--color-red-700)
    }
    &.loading {
      animation: spin 1s linear infinite;
      color: var(--color-blue-700)
    }
    &.warning {
      color: var(--color-amber-700)
    }
    &.success {
      color: var(--color-green-700)
    }
  }
}
</style>
