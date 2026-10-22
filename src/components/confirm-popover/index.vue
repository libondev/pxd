<script lang="ts" setup>
import type { ConfirmPopoverEmits, ConfirmPopoverProps } from './types'
import { computed, shallowRef, watch } from 'vue'
import { usePopoverResponsive } from '../../composables/_internal/use-popover-responsive.js'
import { useConfigProvider } from '../../contexts/config-provider.js'
import { getUniqueId } from '../../utils/helper.js'
import PButton from '../button/index.vue'
import PPopover from '../popover/index.vue'

defineOptions({
  name: 'PConfirmPopover',
  inheritAttrs: false,
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
})

const props = withDefaults(defineProps<ConfirmPopoverProps>(), {
  position: 'top',
  confirmVariant: 'primary',
})

const emits = defineEmits<ConfirmPopoverEmits>()

const titleId = getUniqueId('confirm-popover-title')
// Bumped on every open and close, so a confirm that settles after the popover
// was dismissed cannot confirm an action the user already abandoned.
let sessionId = 0
// Switching to another matched trigger abandons the row the confirm was started for.
let activeTriggerElement: HTMLElement | null = null

const isPending = shallowRef(false)
const localVisible = shallowRef(props.modelValue ?? false)

const configProvider = useConfigProvider()

const computedConfirmText = computed(() => {
  return props.confirmText ?? configProvider.locale.interaction.confirm
})

const computedCancelText = computed(() => {
  return props.cancelText ?? configProvider.locale.interaction.cancel
})

const { isAdaptive, responsiveClasses } = usePopoverResponsive()

function applyVisible(value: boolean) {
  if (localVisible.value === value) {
    return
  }

  sessionId++
  localVisible.value = value

  if (!value) {
    isPending.value = false
  }
}
// The popover owns the trigger, so its own state is authoritative: mirror it
// locally and forward it, otherwise a controlled parent that never writes back
// would leave the popover impossible to close.
function onVisibleChange(value: boolean) {
  applyVisible(value)
  emits('update:modelValue', value)
}

function close() {
  applyVisible(false)
  emits('update:modelValue', false)
}

function onTriggerClick(ev: PointerEvent) {
  if (!props.triggerSelector || !(ev.target instanceof Element)) {
    return
  }

  const trigger = ev.target.closest<HTMLElement>(props.triggerSelector)

  if (!trigger || trigger === activeTriggerElement) {
    return
  }

  activeTriggerElement = trigger
  sessionId++
}

async function onConfirm() {
  if (isPending.value) {
    return
  }

  const session = sessionId

  isPending.value = true

  try {
    const isAllowed = await props.beforeConfirm?.()

    if (isAllowed === false || session !== sessionId) {
      return
    }

    close()
    emits('confirm')
  } catch {
    return
  } finally {
    isPending.value = false
  }
}

function onCancel() {
  if (isPending.value) {
    return
  }

  close()
  emits('cancel')
}

watch(
  () => props.modelValue,
  (value) => {
    if (value !== undefined) {
      applyVisible(value)
    }
  },
)
</script>

<template>
  <PPopover
    data-confirm-popover
    class="pxd-confirm-popover"
    v-bind="$attrs"
    trigger="click"
    :model-value="localVisible"
    :position="position"
    :disabled="disabled"
    :adaptive="isAdaptive"
    :fill-trigger-width="false"
    :auto-focus-element="true"
    :trigger-selector="triggerSelector"
    :wrapper-class="responsiveClasses.wrapper"
    :content-class="responsiveClasses.content"
    :close-on-press-escape="!isPending"
    :lock-scroll-on-visible="isAdaptive"
    @update:model-value="onVisibleChange"
    @trigger-click="onTriggerClick"
  >
    <slot />

    <template #content="{ activeTrigger, activeTriggerIndex }">
      <div class="p-3 max-w-64">
        <slot
          name="content"
          :active-trigger="activeTrigger"
          :active-trigger-index="activeTriggerIndex"
        >
          <h3 v-if="title" :id="titleId" class="m-0 text-sm font-medium">
            {{ title }}
          </h3>

          <p v-if="description" class="m-0 text-[13px] text-foreground-secondary">
            {{ description }}
          </p>
        </slot>
      </div>

      <div class="gap-1.5 px-2 pbe-2 flex items-center justify-end">
        <slot name="actions" :confirm="onConfirm" :cancel="onCancel" :pending="isPending">
          <PButton size="sm" variant="ghost" :disabled="isPending" @click="onCancel">
            {{ computedCancelText }}
          </PButton>

          <PButton size="sm" :variant="confirmVariant" :loading="isPending" @click="onConfirm">
            {{ computedConfirmText }}
          </PButton>
        </slot>
      </div>
    </template>
  </PPopover>
</template>
