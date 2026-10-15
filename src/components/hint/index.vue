<script lang="ts" setup>
import type { HintEmits, HintProps, HintStatus } from './types'
import CrossIcon from '@gdsicon/vue/cross'
import { computed, onBeforeUnmount, shallowRef, watch, watchEffect } from 'vue'
import { TOOLTIP_CONTENT_CLASS, TOOLTIP_VARIANTS } from '../../constants/tooltip-variants.js'
import { useConfigProvider } from '../../contexts/config-provider.js'
import PPopover from '../popover/index.vue'

defineOptions({
  name: 'PHint',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<HintProps>(), {
  position: 'top',
  duration: 1000,
  pauseOnHover: true,
})

const emits = defineEmits<HintEmits>()

const configProvider = useConfigProvider()

const visible = shallowRef(false)
const status = shallowRef<HintStatus>('idle')
const statusValue = shallowRef<unknown>()
const statusError = shallowRef<unknown>()

let closeTimer: ReturnType<typeof setTimeout> | null = null
let closeDeadline = 0
let closeRemaining = 0
let isHovering = false
let promiseToken = 0

const statusVariant = computed(() => {
  const current = status.value

  if (current === 'success' || current === 'error') {
    return current
  }

  return 'default'
})

const computedVariant = computed(() => TOOLTIP_VARIANTS[statusVariant.value])

const contentClassComputed = computed(() => [
  TOOLTIP_CONTENT_CLASS,
  computedVariant.value.base,
  props.contentClass,
])

function clearCloseTimer() {
  if (closeTimer) {
    clearTimeout(closeTimer)
    closeTimer = null
  }
}

function scheduleClose(delay: number) {
  clearCloseTimer()
  closeRemaining = delay

  // promise 未结算就先挂着，duration 到了也不关
  if (!props.duration || delay <= 0 || isHovering || status.value === 'pending') {
    return
  }

  closeDeadline = Date.now() + delay

  closeTimer = setTimeout(() => {
    closeTimer = null
    visible.value = false
  }, delay)
}

function startCloseTimer() {
  if (visible.value) {
    scheduleClose(props.duration)
  }
}

// 悬停期间暂停、离开后按剩余时长续跑，否则用户伸手去点关闭按钮时提示会先消失
function pauseCloseTimer() {
  if (!props.pauseOnHover) {
    return
  }

  isHovering = true

  if (closeTimer) {
    clearCloseTimer()
    closeRemaining = Math.max(0, closeDeadline - Date.now())
  }
}

function resumeCloseTimer() {
  if (!props.pauseOnHover) {
    return
  }

  isHovering = false

  if (!visible.value || closeTimer) {
    return
  }

  scheduleClose(closeRemaining)
}

function handleClose() {
  visible.value = false
}

watch(visible, (isVisible) => {
  if (isVisible) {
    startCloseTimer()
  } else {
    clearCloseTimer()
    isHovering = false
    emits('close')
  }
})

function subscribePromise(promise: Promise<unknown> | undefined) {
  // 换 promise 即换会话，旧请求晚到的结果不能覆盖新请求
  const token = ++promiseToken

  statusValue.value = undefined
  statusError.value = undefined

  if (!promise) {
    status.value = 'idle'
    return
  }

  status.value = 'pending'

  promise.then(
    (value) => {
      if (token !== promiseToken) {
        return
      }

      statusValue.value = value
      status.value = 'success'
      startCloseTimer()
    },
    (error) => {
      if (token !== promiseToken) {
        return
      }

      statusError.value = error
      status.value = 'error'
      startCloseTimer()
    },
  )
}

// 不用 watch(() => props.promise)：Vue 会给 watcher getter 返回的 promise 挂 catch，reject 时报组件错误
watchEffect(() => {
  subscribePromise(props.promise)
})

// 显示期间换内容时重新起跑完整时长，否则用户还没看清新文案提示就先消失了
watch(
  () => props.content,
  () => {
    if (isHovering) {
      closeRemaining = props.duration
      return
    }

    startCloseTimer()
  },
)

onBeforeUnmount(() => {
  clearCloseTimer()
  // 让在飞的结果失效，卸载后不再写状态、不再排计时器
  promiseToken++
})
</script>

<template>
  <PPopover
    data-hint
    role="tooltip"
    class="pxd-hint"
    show-arrow
    :data-variant="statusVariant"
    :model-value="visible"
    :position="position"
    :toggle-on-trigger="false"
    :fill-trigger-width="false"
    wrapper-class="max-sm:data-[position^=top]:px-1 max-sm:data-[position^=bottom]:px-1 max-sm:data-[position^=left]:ps-1 max-sm:data-[position^=right]:pe-1"
    :arrow-color="computedVariant.bg"
    :content-class="contentClassComputed"
    v-bind="$attrs"
    trigger="click"
    :close-on-press-escape="false"
    :close-on-outside-click="false"
    @trigger-click="startCloseTimer"
    @update:model-value="visible = $event"
  >
    <slot :status="status" />

    <template #content="{ activeTrigger, activeTriggerIndex }">
      <div
        class="pxd-hint--content gap-1.5 flex items-center"
        @pointerenter="pauseCloseTimer"
        @pointerleave="resumeCloseTimer"
      >
        <slot
          name="content"
          :status="status"
          :value="statusValue"
          :error="statusError"
          :active-trigger="activeTrigger"
          :active-trigger-index="activeTriggerIndex"
        >
          {{ content }}
        </slot>

        <button
          v-if="closeable"
          type="button"
          class="pxd-hint--close p-0.5 shrink-0 cursor-pointer appearance-none rounded-sm border-0 bg-transparent font-inherit text-inherit opacity-70 self-focus-ring outline-none hover:opacity-100 motion-safe:transition-opacity"
          :aria-label="configProvider.locale.feedback.close"
          @click="handleClose"
        >
          <CrossIcon class="size-3" />
        </button>
      </div>
    </template>
  </PPopover>
</template>
