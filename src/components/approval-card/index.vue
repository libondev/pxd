<script lang="ts" setup>
import type { ComponentVariant } from '../../types/shared'
import type { BadgeVariant } from '../badge/types'
import type {
  ApprovalCardEmits,
  ApprovalCardProps,
  ApprovalCause,
  ApprovalDecision,
  ApprovalResult,
  ApprovalStatus,
} from './types'
import CheckCircleFillIcon from '@gdsicon/vue/check-circle-fill'
import ClockIcon from '@gdsicon/vue/clock'
import CrossCircleFillIcon from '@gdsicon/vue/cross-circle-fill'
import TerminalIcon from '@gdsicon/vue/terminal'
import { computed, onBeforeUnmount, shallowRef, watch } from 'vue'
import { useConfigProvider } from '../../contexts/config-provider.js'
import { isTruthyProp, toArray } from '../../utils/format.js'
import PBadge from '../badge/index.vue'
import PButton from '../button/index.vue'
import PCheckbox from '../checkbox/index.vue'
import PSnippet from '../snippet/index.vue'

defineOptions({
  name: 'PApprovalCard',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<ApprovalCardProps>(), {
  variant: 'warning',
  closeOnPressEscape: true,
})

const emits = defineEmits<ApprovalCardEmits>()

const configProvider = useConfigProvider()

const internalStatus = shallowRef<ApprovalStatus>('pending')
const remembered = shallowRef(false)
let timerId: ReturnType<typeof setTimeout> | undefined

const status = computed<ApprovalStatus>(() => props.modelValue ?? internalStatus.value)
const isPending = computed(() => status.value === 'pending')
const isDisabled = computed(() => isTruthyProp(props.disabled) || isTruthyProp(props.loading))

const computedTitle = computed(() => props.title || configProvider.locale.approval.title)
const computedStatusLabel = computed(() => configProvider.locale.approval[status.value])
const commandList = computed(() => toArray(props.command).filter(Boolean))

const STATUS_ICON: Record<ApprovalStatus, typeof TerminalIcon> = {
  pending: TerminalIcon,
  approved: CheckCircleFillIcon,
  rejected: CrossCircleFillIcon,
  dismissed: ClockIcon,
}

const STATUS_CLASS: Record<ApprovalStatus, string> = {
  pending: '',
  approved: 'border-blue-400 bg-blue-200 text-blue-900',
  rejected: 'border-red-400 bg-red-200 text-red-900',
  dismissed: 'border-gray-400 bg-gray-200 text-gray-900',
}

const STATUS_BADGE: Record<ApprovalStatus, BadgeVariant> = {
  pending: 'amber-subtle',
  approved: 'green-subtle',
  rejected: 'red-subtle',
  dismissed: 'gray-subtle',
}

const VARIANT_CLASS: Record<ComponentVariant, string> = {
  primary: 'border-gray-alpha-400 text-primary',
  error: 'border-red-400 bg-red-200 text-red-900',
  warning: 'border-amber-400 bg-amber-200 text-amber-900',
  success: 'border-green-400 bg-green-200 text-green-900',
}

const statusIcon = computed(() => STATUS_ICON[status.value])
const statusBadge = computed(() => STATUS_BADGE[status.value])

const iconClass = computed(() =>
  isPending.value ? VARIANT_CLASS[props.variant] : STATUS_CLASS[status.value],
)

function clearTimer() {
  if (timerId !== undefined) {
    clearTimeout(timerId)
    timerId = undefined
  }
}

function startTimer() {
  clearTimer()

  const { timeout } = props

  if (!isPending.value || !timeout) {
    return
  }

  timerId = setTimeout(() => {
    dismiss('timeout')
  }, timeout)
}

function commit(next: ApprovalDecision, extra: Omit<ApprovalResult, 'status'> = {}) {
  if (!isPending.value) {
    return
  }

  clearTimer()

  const result: ApprovalResult = { ...extra, status: next }

  internalStatus.value = next
  emits('update:modelValue', next)
  emits('decide', result)

  if (next === 'approved') {
    emits('approve', result)
  } else if (next === 'rejected') {
    emits('reject', result)
  }
}

function approve(reason?: string) {
  commit('approved', {
    reason,
    remember: props.rememberable ? remembered.value : false,
  })
}

function reject(reason?: string) {
  commit('rejected', { reason })
}

function dismiss(cause: ApprovalCause = 'close') {
  commit('dismissed', { cause })
}

function reset() {
  clearTimer()
  remembered.value = false
  internalStatus.value = 'pending'
  emits('update:modelValue', 'pending')
  startTimer()
}

function onEscape() {
  if (!props.closeOnPressEscape) {
    return
  }

  dismiss('escape')
}

watch(() => [status.value, props.timeout], startTimer, { immediate: true })

onBeforeUnmount(clearTimer)

defineExpose({
  status,
  approve,
  reject,
  dismiss,
  reset,
})
</script>

<template>
  <div
    class="pxd-approval-card bg-background p-3 gap-2 flex w-full max-w-full flex-col rounded-xl border"
    :data-status="status"
    :data-variant="variant"
    v-bind="$attrs"
    @keydown.esc="onEscape"
  >
    <div class="pxd-approval-card--header gap-2 flex items-center">
      <div class="pxd-approval-card--icon p-1.5 shrink-0 rounded-md border" :class="iconClass">
        <Component :is="statusIcon" class="size-4" />
      </div>

      <div class="min-w-0 flex-1">
        <div class="pxd-approval-card--title font-medium text-sm truncate text-foreground">
          {{ computedTitle }}
        </div>

        <div
          v-if="description"
          class="pxd-approval-card--description text-sm truncate text-foreground-secondary"
        >
          {{ description }}
        </div>
      </div>

      <PBadge
        v-if="!isPending"
        class="pxd-approval-card--status shrink-0"
        size="sm"
        :variant="statusBadge"
      >
        {{ computedStatusLabel }}
      </PBadge>
    </div>

    <div v-if="commandList.length > 0" class="pxd-approval-card--command">
      <PSnippet :text="commandList" variant="secondary" copy-btn="hover" :prompt="false" />
    </div>

    <div v-if="isPending" class="pxd-approval-card--actions gap-2 flex items-center">
      <div v-if="rememberable" class="pxd-approval-card--remember">
        <PCheckbox
          v-model="remembered"
          :disabled="isDisabled"
          :label="configProvider.locale.approval.remember"
        />
      </div>

      <div class="gap-2 ms-auto flex items-center">
        <PButton :disabled="isDisabled" @click="reject()">
          {{ configProvider.locale.approval.reject }}
        </PButton>

        <PButton variant="primary" :loading="loading" @click="approve()">
          {{ configProvider.locale.approval.approve }}
        </PButton>
      </div>
    </div>
  </div>
</template>
