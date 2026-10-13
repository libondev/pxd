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

const configProvider = useConfigProvider()
const { isAdaptive, responsiveClasses } = usePopoverResponsive()

const titleId = getUniqueId('confirm-popover-title')

const isPending = shallowRef(false)
const localVisible = shallowRef(props.modelValue ?? false)

// Bumped on every open and close, so a confirm that settles after the popover
// was dismissed cannot confirm an action the user already abandoned.
let sessionId = 0

const computedConfirmText = computed(() => {
  return props.confirmText ?? configProvider.locale.interaction.confirm
})

const computedCancelText = computed(() => {
  return props.cancelText ?? configProvider.locale.interaction.cancel
})

function applyVisible(value: boolean) {
  if (localVisible.value === value) {
    return
  }

  sessionId++
  localVisible.value = value
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

watch(
  () => localVisible.value,
  (value) => {
    if (!value) {
      isPending.value = false
    }
  },
)
</script>

<template>
  <PPopover
    data-confirm-popover
    class="pxd-confirm-popover"
    trigger="click"
    :model-value="localVisible"
    :position="position"
    :disabled="disabled"
    :adaptive="isAdaptive"
    :fill-trigger-width="false"
    :auto-focus-element="true"
    :wrapper-class="responsiveClasses.wrapper"
    :content-class="responsiveClasses.content"
    :close-on-press-escape="!isPending"
    :lock-scroll-on-visible="isAdaptive"
    v-bind="$attrs"
    @update:model-value="onVisibleChange"
  >
    <slot />

    <template #content>
      <div class="px-3 py-2">
        <slot name="content" :confirm="onConfirm" :cancel="onCancel" :pending="isPending">
          <h3 v-if="title" :id="titleId" class="m-0 text-sm font-medium">
            {{ title }}
          </h3>

          <p v-if="description" class="m-0 text-13 text-foreground-secondary">
            {{ description }}
          </p>
        </slot>
      </div>

      <div class="gap-1.5 px-2 pbe-2 ms-auto flex items-center justify-end">
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
