<script lang="ts" setup>
import type { MessageItemType } from '../../composables/use-message'
import type { ComponentPosition } from '../../types/shared/props'

import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
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
    max: 5,
    group: 'default',
    position: 'top',
  },
)

const groupMessages = ref<MessageItemType[]>([])

const visibleMessages = computed(() => {
  const max = Math.max(props.max, 0)
  const list = groupMessages.value

  if (!max || max <= 0) {
    return list
  }

  return list.slice(-max)
})

function getMessageByKey(key: MessageItemType['key']) {
  const index = groupMessages.value.findIndex(m => m.key === key)
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
    closeMessageByKey(message.key)
  }, message._remainingMs)
}

function pauseMessageByKey(key: MessageItemType['key']) {
  if (!key) {
    return
  }

  const { message } = getMessageByKey(key)

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

function resumeMessageByKey(key: string) {
  if (!key) {
    return
  }

  const { message } = getMessageByKey(key)

  if (!message) {
    return
  }

  if (!message.durations || message.durations <= 0) {
    return
  }

  const remaining = message._remainingMs ?? 0
  // 若剩余时间非常短，直接关闭，减少一次极短定时器调度
  if (remaining <= 0 || remaining <= 100) {
    closeMessageByKey(key)
    return
  }

  setAutoCloseTimer(message)
}

function closeMessageByKey(key: MessageItemType['key']) {
  const { index, message } = getMessageByKey(key)

  if (!message) {
    return
  }

  if (message && message._timerId) {
    clearTimeout(message._timerId)
    message._timerId = undefined
  }

  groupMessages.value.splice(index, 1)
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

function onCreateMessage({ detail: data }: CustomEvent<MessageItemType>) {
  if (!data || data.group !== props.group) {
    return
  }

  if (data.durations) {
    setAutoCloseTimer(data)
  }

  groupMessages.value.unshift(data)
}

function onRemoveMessage({ detail: data }: CustomEvent<MessageItemType>) {
  if (!data || !data.key || data.group !== props.group) {
    return
  }

  closeMessageByKey(data.key)
}

function onClearMessages({ detail: data }: CustomEvent<MessageItemType>) {
  if (!data || data.group !== props.group) {
    return
  }

  clearMessage()
}

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
  visibleMessages,
  get: getMessageByKey,
  pause: pauseMessageByKey,
  resume: resumeMessageByKey,
  close: closeMessageByKey,
  clear: clearMessage,
})
</script>

<template>
  <PTeleport to="body">
    <section
      class="pxd-message px-4 fixed z-20 flex w-full"
      tabindex="-1"
      aria-live="polite"
      aria-label="Notifications"
      :data-expand="expand"
      :data-position="position"
    >
      <ol
        v-if="groupMessages.length"
        tag="ol"
        tabindex="-1"
        class="pxd-message--group min-w-16 relative flex w-full"
        :style="{ '--message-item-width': getCssUnitValue(width) }"
        :class="{ 'gap-3': expand }"
      >
        <PMessageItem
          v-for="(item, index) of groupMessages"
          :key="item.key"
          :max="max"
          :type="item.type"
          :index="index"
          :class="item.class"
          :expand="expand"
          :message="item.message"
        />
      </ol>
    </section>
  </PTeleport>
</template>

<style lang="postcss">
.pxd-message {
  .pxd-message--group {
    --message-item-width: 356px;
    max-width: 100vw;
    align-items: center;
    flex-direction: column;
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

  &[data-expand="false"] {
    .pxd-message--item {
      --scale: var(--index) * 0.05 + 1;
      --transition: transform .4s, opacity .4s, height .4s, box-shadow .2s;
      --transform: translateY(calc(var(--item-offset) * var(--index))) scale(calc(-1 * var(--scale)));
      transition-timing-function: ease;

      &[data-mount="false"] {
        --transform: translateY(var(--starting-offset));
      }
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
