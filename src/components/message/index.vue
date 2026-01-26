<script lang="ts" setup>
import type { MessageItemHeightType, MessageItemType } from '../../composables/use-message'
import type { ComponentPosition } from '../../types/shared/props'

import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useDocumentHidden } from '../../composables/use-document-hidden'
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

const emits = defineEmits<{
  close: [id: MessageItemType['id']]
}>()

useDocumentHidden((isHidden) => {
  if (isHidden) {
    pauseAllMessages()
  } else {
    resumeAllMessages()
  }
})

const groupExpand = ref(props.expand)
const groupMessages = ref<MessageItemType[]>([])
const messageItemsHeight = ref<MessageItemHeightType[]>([])

const messageGroupStyle = computed(() => {
  const frontHeight = messageItemsHeight.value[0]?.height || 0
  const visibleItemCounts = Math.min(props.max, groupMessages.value.length)

  return {
    '--message-width': getCssUnitValue(props.width),
    '--message-items': visibleItemCounts,
    '--message-front-height': getCssUnitValue(frontHeight),
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

function pauseMessage(message: MessageItemType) {
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

function resumeMessage(message: MessageItemType) {
  if (!message.durations || message.durations <= 0) {
    return
  }

  const remaining = message._remainingMs ?? 0
  // if remaining time is very short,
  // close directly to reduce one short timer scheduling
  if (remaining <= 100) {
    closeMessageById(message.id)
    return
  }

  setAutoCloseTimer(message)
}

function pauseMessageById(id: MessageItemType['id']) {
  if (!id) {
    return
  }

  const { message } = getMessageById(id)
  if (message) {
    pauseMessage(message)
  }
}

function resumeMessageById(id: MessageItemType['id']) {
  if (!id) {
    return
  }

  const { message } = getMessageById(id)
  if (message) {
    resumeMessage(message)
  }
}

function closeMessageById(id: MessageItemType['id']) {
  const { index, message } = getMessageById(id)

  if (!message) {
    return
  }

  if (message._timerId) {
    clearTimeout(message._timerId)
    message._timerId = undefined
  }

  groupMessages.value.splice(index, 1)

  // Sync remove height info by id instead of index to avoid mismatch
  const heightIndex = messageItemsHeight.value.findIndex(h => h.id === id)
  if (heightIndex !== -1) {
    messageItemsHeight.value.splice(heightIndex, 1)
  }

  // Avoid manually closing all data and maintaining the expanded state when creating again
  if (!props.expand && groupMessages.value.length === 0) {
    groupExpand.value = false
  }

  emits('close', id)
}

function setItemHeight(info: MessageItemHeightType) {
  messageItemsHeight.value.unshift(info)
}

function clearMessage() {
  groupMessages.value.forEach((m) => {
    if (m._timerId) {
      clearTimeout(m._timerId)
      m._timerId = undefined
    }
  })

  groupMessages.value = []
  messageItemsHeight.value = []
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
  groupMessages.value.forEach(pauseMessage)
}

function resumeAllMessages() {
  groupMessages.value.forEach(resumeMessage)
}

// Avoid repeatedly triggering enter/leave when expanding
const TRANSITION_LOCK_MS = 250
const LEAVE_DEBOUNCE_MS = 200

let leaveTimeoutId: ReturnType<typeof setTimeout> | undefined
let isTransitioning = false

function onPointerEnter() {
  clearTimeout(leaveTimeoutId)

  // If already expanded or transitioning, skip to prevent layout thrashing
  if (groupExpand.value || isTransitioning) {
    return
  }

  isTransitioning = true
  groupExpand.value = true
  pauseAllMessages()

  // Unlock after layout stabilizes
  setTimeout(() => {
    isTransitioning = false
  }, TRANSITION_LOCK_MS)
}

function onPointerLeave() {
  clearTimeout(leaveTimeoutId)

  // Ignore leave events during transition
  if (isTransitioning) {
    return
  }

  leaveTimeoutId = setTimeout(() => {
    resumeAllMessages()

    // If expand is set in props,
    // the user's default configuration cannot be modified when moving out.
    if (props.expand) {
      return
    }

    isTransitioning = true
    groupExpand.value = false

    setTimeout(() => {
      isTransitioning = false
    }, TRANSITION_LOCK_MS)
  }, LEAVE_DEBOUNCE_MS)
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

  cachedOff(window, CLEAR_MESSAGES_EVENT_NAME, onClearMessages)
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
        class="pxd-message--group min-w-16 p-0 m-0 flex h-auto w-full"
        :class="{ 'gap-3': groupExpand }"
        @pointerenter="onPointerEnter"
        @pointerleave="onPointerLeave"
      >
        <PMessageItem
          v-for="(item, index) of groupMessages"
          :key="item.id"
          :max="max"
          :index="index"
          :item-data="item"
          @close="closeMessageById"
          @set-height="setItemHeight"
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
  }

  &[data-position^="top"] {
    --item-offset: 10px;
    --starting-offset: -100%;
    top: 1rem;
  }

  &[data-position^="bottom"] {
    --item-offset: -10px;
    --starting-offset: 100%;
    bottom: 1rem;

    .pxd-message--group {
      flex-direction: column-reverse;
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
    left: 1rem;
    justify-content: flex-start;

    .pxd-message--group {
      align-items: flex-start;
    }
  }

  &[data-position="top-end"],
  &[data-position="bottom-end"] {
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

  &[data-expand="true"] {
    .pxd-message--group {
      --message-placeholder-height: calc(var(--message-front-height) * (var(--message-items) + 1));
    }

    .pxd-message--item {
      --message-item-transform: none;
      position: relative;
      will-change: transform, opacity, height;
    }
  }

  &[data-expand="false"] {
    .pxd-message--group {
      --message-placeholder-height: calc(var(--message-front-height) + var(--message-items) * 12px);
    }

    .pxd-message--item {
      --message-item-transform: translateZ(0) translateY(calc(var(--item-offset) * var(--message-item-index))) scale(calc(-1 * var(--message-item-scale)));
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
      transition-property: transform, opacity;
    }

    .pxd-transition-message-leave-active {
      position: absolute;
    }

    .pxd-transition-message-enter-from,
    .pxd-transition-message-leave-to {
      opacity: 0;
      --message-item-transform: translateZ(0) translateY(var(--starting-offset)) scaleX(0.95);
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
