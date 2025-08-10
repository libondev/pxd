<script lang="ts" setup>
import type { ComponentPosition } from '../../types/shared/props'
import SuccessFillIcon from '@gdsicon/vue/check-circle-fill'
import CloseIcon from '@gdsicon/vue/cross'
import ErrorFillIcon from '@gdsicon/vue/cross-circle-fill'
import InformationFillIcon from '@gdsicon/vue/information-fill'
import WarningFillIcon from '@gdsicon/vue/warning-fill'
import { computed } from 'vue'
import { closeMessage, messages, pauseMessage, resumeMessage } from '../../composables/use-message'
import PButton from '../button/index.vue'
import PTeleport from '../teleport/index.vue'

interface Props {
  max?: number
  group?: string
  zIndex?: string | number
  position?: ComponentPosition<'top' | 'bottom'>
}

defineOptions({
  name: 'PMessage',
})

const props = withDefaults(
  defineProps<Props>(),
  {
    max: 6,
    group: 'default',
    position: 'top',
  },
)

const TYPE_ICONS = {
  info: InformationFillIcon,
  success: SuccessFillIcon,
  warning: WarningFillIcon,
  error: ErrorFillIcon,
}

const ITEM_SELECTOR = '.pxd-message--item'

const groupMessages = computed(() => messages.value.filter(m => m.group === props.group))

const visibleMessages = computed(() => {
  const max = Math.max(props.max, 0)
  const list = groupMessages.value

  if (!max || max <= 0) {
    return list
  }

  return list.slice(-max)
})

function getItemElementFromEvent(e: PointerEvent) {
  const target = e.target as Element | null

  if (!target) {
    return null
  }

  return target.closest<HTMLElement>(ITEM_SELECTOR)
}

function getRelatedItemElement(e: PointerEvent) {
  const related = e.relatedTarget as Element | null

  if (!related) {
    return null
  }

  return related.closest<HTMLElement>(ITEM_SELECTOR)
}

function onPointerOver(e: PointerEvent) {
  const currentItem = getItemElementFromEvent(e)
  if (!currentItem) {
    return
  }

  const relatedItem = getRelatedItemElement(e)
  if (currentItem === relatedItem) {
    return
  }

  const key = currentItem.dataset.key
  if (key != null) {
    pauseMessage(key)
  }
}

function onPointerOut(e: PointerEvent) {
  const currentItem = getItemElementFromEvent(e)
  if (!currentItem) {
    return
  }

  const relatedItem = getRelatedItemElement(e)
  if (currentItem === relatedItem) {
    return
  }

  const key = currentItem.dataset.key
  if (key != null) {
    resumeMessage(key)
  }
}
</script>

<template>
  <PTeleport to="body">
    <div
      class="pxd-message p-4 pointer-events-none fixed z-10 w-full"
      :style="{ zIndex }"
      :data-position="position"
    >
      <TransitionGroup
        name="pxd-transition--fade-scale"
        tag="div"
        class="pxd-message--group gap-3 sm:pointer-events-auto relative flex"
        appear
        @pointerover="onPointerOver"
        @pointerout="onPointerOut"
      >
        <output
          v-for="item of visibleMessages"
          :key="item.key"
          role="status"
          aria-live="polite"
          :data-key="item.key"
          :data-type="item.type"
          :class="item.class"
          class="pxd-message--item group py-2 pl-3 pr-2 text-sm flex w-max max-w-full items-center rounded-lg bg-background-100 shadow-border-modal"
        >
          <component :is="TYPE_ICONS[item.type]" v-if="item.type" class="pxd-message--icon mr-2 shrink-0" :class="item.type" />

          <span v-if="typeof item.message === 'string'">
            {{ item.message }}
          </span>
          <component :is="item.message" v-else :key="item.key" />

          <PButton
            v-if="item.closeable"
            icon
            size="xs"
            variant="ghost"
            class="ml-1 touch-none text-foreground-secondary"
            @click="closeMessage(item.key)"
          >
            <CloseIcon />
          </PButton>
        </output>
      </TransitionGroup>
    </div>
  </PTeleport>
</template>

<style lang="postcss">
.pxd-message {
  max-width: min(500px, 100vw);
  max-height: min(800px, 50vh);

  .pxd-message--item {
    --scale: .95;
  }

  .pxd-message--group {
    align-items: center;
    flex-direction: column;
  }

  &[data-position^="top"] {
    top: 0;

    .pxd-message--item {
      transform-origin: top center;
    }
  }

  &[data-position^="bottom"] {
    bottom: 0;

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
    transform: translateX(-50%);
  }

  &[data-position="top-start"],
  &[data-position="bottom-start"] {
    .pxd-message--group {
      align-items: flex-start;
    }
  }

  &[data-position="top-end"],
  &[data-position="bottom-end"] {
    right: 0;

    .pxd-message--group {
      align-items: flex-end;
    }
  }

  .pxd-message--icon {
    &.info {
      color: var(--color-gray-600)
    }
    &.error {
      color: var(--color-red-700)
    }
    &.warning {
      color: var(--color-yellow-500)
    }
    &.success {
      color: var(--color-green-700)
    }
  }
}

.relative > .pxd-transition--fade-scale-leave-active {
  position: absolute;
}
</style>
